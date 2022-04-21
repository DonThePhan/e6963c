import { Box, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    justifyContent: "space-between",
    marginLeft: 20,
    marginRight: 20,
    flexGrow: 1,
    alignItems: "center",
  },
  username: {
    fontWeight: "bold",
    letterSpacing: -0.2,
  },
  previewText: {
    fontSize: 12,
    color: "#9CADC8",
    letterSpacing: -0.17,
  },
  previewTextUnread: {
    fontSize: 12,
    color: "black",
    letterSpacing: -0.17,
    fontWeight: "bold",
  },
  unreadMessageCount: {
    background: "#3e92ff",
    padding: "2px 8px",
    borderRadius: "50vh",
    color: "white",
  },
}));

const ChatContent = ({ conversation, userId, unread }) => {
  const classes = useStyles();

  const { otherUser } = conversation;
  const latestMessageText = conversation.id && conversation.latestMessageText;

  return (
    <Box className={classes.root}>
      <Box>
        <Typography className={classes.username}>{otherUser.username}</Typography>
        <Typography className={unread ? classes.previewTextUnread : classes.previewText}>
          {latestMessageText}
        </Typography>
      </Box>
      {unread > 0 && <Typography className={classes.unreadMessageCount}>{unread}</Typography>}
    </Box>
  );
};

export default ChatContent;
