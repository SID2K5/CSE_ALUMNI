import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../../services/api";
import { highlightText } from "../../utils/highlight";

const Search = () => {
  const [params] = useSearchParams();
  const query = params.get("q");

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSearch = async () => {
    const { data } = await API.get(`/search?query=${query}`);
    setResults(data);
    setLoading(false);
  };

  useEffect(() => {
    if (query) fetchSearch();
  }, [query]);

  if (loading) return <p className="text-center mt-10">Searching...</p>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        Results for "{query}"
      </h1>

      {/* USERS */}
      {results.users?.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Users</h2>
          {results.users.map((u) => (
            <div key={u._id} className="glass p-3 mb-2">
              👤 {highlightText(u.name, query)}
            </div>
          ))}
        </div>
      )}

      {/* POSTS */}
      {results.posts?.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Posts</h2>
          {results.posts.map((p) => (
            <div key={p._id} className="glass p-3 mb-2">
              📝 {highlightText(p.content, query)}
            </div>
          ))}
        </div>
      )}

      {/* JOBS */}
      {results.jobs?.length > 0 && (
        <div>
          <h2 className="font-semibold mb-2">Jobs</h2>
          {results.jobs.map((j) => (
            <div key={j._id} className="glass p-3 mb-2">
              💼 {highlightText(j.title, query)}
            </div>
          ))}
        </div>
      )}

      {!results.users?.length &&
        !results.posts?.length &&
        !results.jobs?.length && (
          <p className="text-gray-500">No results found</p>
        )}

    </div>
  );
};

export default Search;