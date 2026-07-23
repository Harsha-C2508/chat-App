import { ChatState } from "../../Context/ChatProvider";
import SingleChat from "./model/SingleChat";
import { C } from "../../config/themeColors";

const ChatBox = ({ fetchAgain, setFetchAgain }) => {
  return (
    <div style={{
      flex: 1, display: 'flex',
      flexDirection: 'column', height: '100%',
      backgroundColor: C.bgBase, overflow: 'hidden', fontFamily: C.font,
      minWidth: 0,
    }}>
      <SingleChat fetchAgain={fetchAgain} setFetchAgain={setFetchAgain} />
    </div>
  );
};

export default ChatBox;
