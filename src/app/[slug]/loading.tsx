export default function LoadingMenu() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-white">
      <div className="flex flex-col items-center space-y-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-black"></div>
        <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">Loading Menu...</p>
      </div>
    </div>
  );
}
