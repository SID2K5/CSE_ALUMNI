const JobSkeleton = () => {
  return (
    <div className="p-4 rounded-xl bg-[#0f172a] border border-gray-800 animate-pulse">
      <div className="h-5 w-2/3 bg-gray-700 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-700 rounded mb-2"></div>
      <div className="h-3 w-full bg-gray-800 rounded mb-1"></div>
      <div className="h-3 w-5/6 bg-gray-800 rounded mb-3"></div>
      <div className="h-9 bg-gray-700 rounded-lg"></div>
    </div>
  );
};

export default JobSkeleton;