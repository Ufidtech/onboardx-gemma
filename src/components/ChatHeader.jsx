export default function ChatHeader() {
  return (
    <div className="bg-[#008069] text-white p-4 flex items-center shadow-md z-10">
      <div className="w-10 h-10 bg-gray-300 rounded-full mr-3 flex items-center justify-center font-bold text-gray-500">
        AI
      </div>
      <div>
        <h1 className="font-semibold text-lg leading-tight">OnboardX Agent</h1>
        <p className="text-xs text-green-100">online</p>
      </div>
    </div>
  );
}
