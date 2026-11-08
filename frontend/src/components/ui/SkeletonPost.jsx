const SkeletonPost = () => {
  return (
    <div className="glass p-4 animate-pulse space-y-3">

      <div className="flex gap-3">
        <div className="w-10 h-10 bg-gray-700 rounded-full"></div>
        <div className="h-4 w-32 bg-gray-700 rounded"></div>
      </div>

      <div className="h-3 bg-gray-700 rounded w-full"></div>
      <div className="h-3 bg-gray-700 rounded w-5/6"></div>

      <div className="h-40 bg-gray-700 rounded"></div>

    </div>
  );
};

export default SkeletonPost;