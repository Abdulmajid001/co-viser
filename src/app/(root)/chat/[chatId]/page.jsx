// import MessageWithForm from '@/modules/messages/components/message-with-form';
import ActiveChatLoader from '@/modules/messages/components/active-chat-loader';

const Page = async ({ params }) => {
  const { chatId } = await params;
  return (
    <>
      <ActiveChatLoader chatId={chatId} />
      <div>chatId={chatId} </div>
      {/* <MessageWithForm chatId={chatId} /> */}
    </>
  )
}

export default Page