import React, { useCallback, useEffect, useState, useContext, Fragment } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";
import { Grid, CssBaseline, Button } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { SidebarContainer } from "../components/Sidebar";
import { ActiveChat } from "../components/ActiveChat";
import { SocketContext } from "../context/socket";

import { markMessagesAsReadFrontEnd, markMessagesAsReadBackEnd } from "../helpers";

const useStyles = makeStyles((theme) => ({
  root: {
    height: "100vh",
  },
}));

const Home = ({ user, logout }) => {
  const history = useHistory();

  const socket = useContext(SocketContext);

  const [ conversations, setConversations ] = useState([]);
  const [ activeConversation, setActiveConversation ] = useState(null);

  const classes = useStyles();
  const [ isLoggedIn, setIsLoggedIn ] = useState(false);

  const addSearchedUsers = (users) => {
    const currentUsers = {};

    // make table of current users so we can lookup faster
    conversations.forEach((convo) => {
      currentUsers[convo.otherUser.id] = true;
    });

    const newState = [ ...conversations ];
    users.forEach((user) => {
      // only create a fake convo if we don't already have a convo with this user
      if (!currentUsers[user.id]) {
        let fakeConvo = { otherUser: user, messages: [] };
        newState.push(fakeConvo);
      }
    });

    setConversations(newState);
  };

  const clearSearchedUsers = () => {
    setConversations((prev) => prev.filter((convo) => convo.id));
  };

  const saveMessage = async (body) => {
    const { data } = await axios.post("/api/messages", body);
    return data;
  };

  const sendMessage = (data, body) => {
    socket.emit("new-message", {
      message: data.message,
      recipientId: body.recipientId,
      sender: data.sender,
    });
  };

  const postMessage = async (body) => {
    try {
      const data = await saveMessage(body);

      if (!body.conversationId) {
        addNewConvo(body.recipientId, data.message);
      } else {
        addMessageToConversation(data);
      }

      sendMessage(data, body);
    } catch (error) {
      console.error(error);
    }
  };

  const addNewConvo = useCallback(
    (recipientId, message) => {
      setConversations((prev) =>
        prev.map((convo) => {
          if (convo.otherUser.id === recipientId) {
            const convoCopy = { ...convo, messages: [ ...convo.messages ] };
            convoCopy.messages.push(message);
            convoCopy.latestMessageText = message.text;
            convoCopy.id = message.conversationId;
            return convoCopy;
          }
          return convo;
        }),
      );
    },
    [ setConversations ],
  );

  const addMessageToConversation = useCallback(
    (data) => {
      // if sender isn't null, that means the message needs to be put in a brand new convo
      const { message, sender = null } = data;
      if (sender !== null) {
        const convoCopy = {
          id: message.conversationId,
          otherUser: sender,
          messages: [ message ],
        };
        convoCopy.latestMessageText = message.text;
        setConversations((prev) => [ convoCopy, ...prev ]);
      } else {
        // add message to current convo
        setConversations((prev) =>
          prev.map((convo) => {
            if (convo.id === message.conversationId) {
              const convoCopy = JSON.parse(JSON.stringify(convo));
              convoCopy.messages.push(message);
              convoCopy.latestMessageText = message.text;
              return convoCopy;
            }
            return convo;
          }),
        );

        // if conversation is open while message received
        if (message.senderId === activeConversation) {
          markMessagesAsReadBackEnd({ senderId: message.senderId, conversationId: message.conversationId });
          markMessagesAsReadFrontEnd({
            senderId: message.senderId,
            conversationId: message.conversationId,
            setConversations,
          });

          // tell OTHER user that all messages from active chat were read by THIS user ('read = true')
          socket.emit("messages-read", {
            conversationId: message.conversationId,
            recipientId: user.id,
          });
        }
      }
    },
    [ setConversations, activeConversation, socket, user.id ],
  );

  // when recipient informed you they've read your conversation messages, update your frontend to reflect that
  const handleReadMessages = useCallback(
    (data) => {
      if (data.recipientId !== user.id) {
        markMessagesAsReadFrontEnd({ senderId: user.id, conversationId: data.conversationId, setConversations });
      }
    },
    [ user.id ],
  );

  const setActiveChat = async (otherUserId) => {
    setActiveConversation(otherUserId);

    const convo = conversations.find((convo) => convo.otherUser.id === otherUserId);
    const senderId = otherUserId;
    const conversationId = convo.id;

    // Backend - mark all messages recieved by THIS user from active chat as read ('read = true')
    markMessagesAsReadBackEnd({ senderId, conversationId });

    // tell OTHER user that all messages from active chat were read by THIS user ('read = true')
    socket.emit("messages-read", {
      conversationId: convo.id,
      userId: user.id,
    });
  };

  const addOnlineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = JSON.parse(JSON.stringify(convo));
          convoCopy.otherUser = { ...convoCopy.otherUser, online: true };
          return convoCopy;
        } else {
          return convo;
        }
      }),
    );
  }, []);

  const removeOfflineUser = useCallback((id) => {
    setConversations((prev) =>
      prev.map((convo) => {
        if (convo.otherUser.id === id) {
          const convoCopy = JSON.parse(JSON.stringify(convo));
          convoCopy.otherUser = { ...convoCopy.otherUser, online: false };
          return convoCopy;
        } else {
          return convo;
        }
      }),
    );
  }, []);

  // Lifecycle
  useEffect(
    () => {
      // Socket init
      socket.on("add-online-user", addOnlineUser);
      socket.on("remove-offline-user", removeOfflineUser);
      socket.on("new-message", addMessageToConversation);
      socket.on("messages-read", handleReadMessages);

      return () => {
        // before the component is destroyed
        // unbind all event handlers used in this component
        socket.off("add-online-user", addOnlineUser);
        socket.off("remove-offline-user", removeOfflineUser);
        socket.off("new-message", addMessageToConversation);
        socket.off("messages-read", handleReadMessages);
      };
    },
    [ addMessageToConversation, addOnlineUser, removeOfflineUser, handleReadMessages, socket ],
  );

  useEffect(
    () => {
      // when fetching, prevent redirect
      if (user.isFetching) return;

      if (user && user.id) {
        setIsLoggedIn(true);
      } else {
        // If we were previously logged in, redirect to login instead of register
        if (isLoggedIn) history.push("/login");
        else history.push("/register");
      }
    },
    [ user, history, isLoggedIn ],
  );

  useEffect(
    () => {
      const fetchConversations = async () => {
        try {
          const { data: retrievedMessages } = await axios.get("/api/conversations");
          setConversations(retrievedMessages);
        } catch (error) {
          console.error(error);
        }
      };
      if (!user.isFetching) {
        fetchConversations();
      }
    },
    [ user ],
  );

  const handleLogout = async () => {
    if (user && user.id) {
      await logout(user.id);
    }
  };

  return (
    <Fragment>
      <Button onClick={handleLogout}>Logout</Button>
      <Grid container component='main' className={classes.root}>
        <CssBaseline />
        <SidebarContainer
          conversations={conversations}
          user={user}
          clearSearchedUsers={clearSearchedUsers}
          addSearchedUsers={addSearchedUsers}
          setActiveChat={setActiveChat}
          activeConversation={activeConversation}
        />
        <ActiveChat
          activeConversation={activeConversation}
          conversations={conversations}
          user={user}
          postMessage={postMessage}
        />
      </Grid>
    </Fragment>
  );
};

export default Home;
