import {
  useEffect,
  useState,
} from "react";

import API from "../../services/api";

import toast from "react-hot-toast";

const ReportedPosts = () => {

  const [posts, setPosts] =
    useState([]);

  const fetchPosts =
    async () => {

      try {

        const { data } =
          await API.get(
            "/posts/reported/all"
          );

        setPosts(data);

      } catch (error) {

        console.error(error);

      }

    };

  useEffect(() => {

    fetchPosts();

  }, []);

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete =
    async (id) => {

      try {

        await API.delete(
          `/posts/${id}`
        );

        setPosts((prev) =>
          prev.filter(
            (p) => p._id !== id
          )
        );

        toast.success(
          "Post removed 🚨"
        );

      } catch {

        toast.error(
          "Delete failed"
        );

      }

    };

  /* =====================================================
     IGNORE REPORT
  ===================================================== */

  const handleIgnore =
    async (id) => {

      try {

        await API.put(
          `/admin/ignore-report/${id}`
        );

        setPosts((prev) =>
          prev.filter(
            (p) => p._id !== id
          )
        );

        toast.success(
          "Report ignored"
        );

      } catch {

        toast.error(
          "Failed"
        );

      }

    };

  return (

    <div className="
      glass
      rounded-3xl
      p-6
      space-y-5
    ">

      <h2 className="
        text-2xl
        font-bold
        text-red-500
      ">
        Reported Posts 🚨
      </h2>

      {posts.length === 0 ? (

        <p className="
          text-gray-500
        ">
          No reported posts
        </p>

      ) : (

        posts.map((post) => (

          <div
            key={post._id}
            className="
              border
              border-red-200
              dark:border-red-900
              rounded-2xl
              p-4
              space-y-3
            "
          >

            <div className="
              flex
              justify-between
              items-center
            ">

              <div>

                <h3 className="
                  font-semibold
                  text-black
                  dark:text-white
                ">
                  {post.user.name}
                </h3>

                <p className="
                  text-sm
                  text-red-500
                ">
                  {post.reports.length}
                  {" "}
                  reports
                </p>

              </div>

            </div>

            <p className="
              text-black
              dark:text-white
            ">
              {post.content}
            </p>

            <div className="
              flex gap-3
            ">

              <button
                onClick={() =>
                  handleDelete(
                    post._id
                  )
                }
                className="
                  px-4 py-2
                  rounded-xl
                  bg-red-500
                  text-white
                "
              >
                Delete
              </button>

              <button
                onClick={() =>
                  handleIgnore(
                    post._id
                  )
                }
                className="
                  px-4 py-2
                  rounded-xl
                  bg-gray-300
                  dark:bg-gray-700
                  text-black
                  dark:text-white
                "
              >
                Ignore
              </button>

            </div>

          </div>

        ))

      )}

    </div>

  );

};

export default ReportedPosts;