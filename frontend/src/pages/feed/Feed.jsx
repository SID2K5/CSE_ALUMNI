import { useEffect, useState } from "react";

import { getPosts } from "../../services/postService";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import {
  Hash,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import PostCard from "../../components/ui/PostCard";
import CreatePost from "../../components/ui/CreatePost";
import SkeletonPost from "../../components/ui/SkeletonPost";

import { useAuth } from "../../context/AuthContext";

import AdminPanel from "../../pages/admin/AdminPanel";

import socket from "../../socket";

const Feed = () => {

  const [posts, setPosts] = useState([]);

  const [page, setPage] = useState(1);

  const [loading, setLoading] =
    useState(true);

  const [hasMore, setHasMore] =
    useState(true);

  const [selectedTag, setSelectedTag] =
    useState("");

  const { user } = useAuth();

  /* =====================================================
     FETCH POSTS
  ===================================================== */

  const fetchPosts = async (
    reset = false
  ) => {

    try {

      setLoading(true);

      const currentPage =
        reset ? 1 : page;

      const { data } =
        await getPosts(currentPage);

      let filteredPosts =
        data.posts;

      // FILTER USING TAG
      if (selectedTag) {

        filteredPosts =
          filteredPosts.filter((p) =>
            p.hashtags?.includes(
              selectedTag
            )
          );

      }

      if (reset) {

        setPosts(filteredPosts);

      } else {

        setPosts((prev) => {

          const existingIds =
            new Set(
              prev.map((p) => p._id)
            );

          const filtered =
            filteredPosts.filter(
              (p) =>
                !existingIds.has(
                  p._id
                )
            );

          return [
            ...prev,
            ...filtered,
          ];

        });

      }

      setHasMore(
        currentPage < data.pages
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }

  };

  /* =====================================================
     INITIAL LOAD
  ===================================================== */

  useEffect(() => {

    fetchPosts();

  }, [page]);

  /* =====================================================
     HASHTAG FILTER
  ===================================================== */

  useEffect(() => {

    setPage(1);

    fetchPosts(true);

  }, [selectedTag]);

  /* =====================================================
     INFINITE SCROLL
  ===================================================== */

  useEffect(() => {

    const handleScroll = () => {

      if (
        window.innerHeight +
          window.scrollY >=
          document.body.offsetHeight -
            200 &&
        !loading &&
        hasMore
      ) {

        setPage((prev) => prev + 1);

      }

    };

    window.addEventListener(
      "scroll",
      handleScroll
    );

    return () =>
      window.removeEventListener(
        "scroll",
        handleScroll
      );

  }, [loading, hasMore]);

  /* =====================================================
     REALTIME POSTS
  ===================================================== */

  useEffect(() => {

    socket.on(
      "postUpdated",
      (updatedPost) => {

        setPosts((prev) =>
          prev.map((p) =>
            p._id ===
            updatedPost._id
              ? updatedPost
              : p
          )
        );

      }
    );

    socket.on(
      "newPost",
      (newPost) => {

        setPosts((prev) => [
          newPost,
          ...prev,
        ]);

      }
    );

    return () => {

      socket.off("postUpdated");

      socket.off("newPost");

    };

  }, []);

  /* =====================================================
     JOIN USER ROOM
  ===================================================== */

  useEffect(() => {

    if (user?._id) {

      socket.emit(
        "join",
        user._id
      );

    }

  }, [user]);

  return (

    <div
      className="
        w-full
        max-w-[1000px]
        mx-auto
        pb-16
      "
    >

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -15,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          sticky
          top-20
          z-20
          backdrop-blur-xl
          bg-white/80
          dark:bg-[#020617]/80
          border
          border-gray-200
          dark:border-gray-800
          rounded-3xl
          px-5 md:px-7
          py-5
          mb-8
          shadow-sm
        "
      >

        <div
          className="
            flex
            flex-col
            gap-5
          "
        >

          {/* TOP */}

          <div
            className="
              flex
              items-center
              justify-between
            "
          >

            <div>

              <div
                className="
                  flex
                  items-center
                  gap-2
                "
              >

                <Sparkles
                  className="
                    text-purple-500
                  "
                  size={26}
                />

                <h1
                  className="
                    text-4xl
                    md:text-5xl
                    font-black
                    tracking-tight
                    gradient-text
                  "
                >
                  Feed
                </h1>

              </div>

              <p
                className="
                  text-gray-600
                  dark:text-gray-400
                  mt-2
                  text-sm
                  md:text-base
                "
              >
                Connect with students,
                alumni & opportunities 🚀
              </p>

            </div>

            {/* TRENDING */}

            <div
              className="
                hidden
                md:flex
                items-center
                gap-2
                text-purple-500
                font-semibold
              "
            >

              <TrendingUp size={18} />

              Trending

            </div>

          </div>

          {/* ===================================================== */}
          {/* TRENDING TAGS */}
          {/* ===================================================== */}

          <div
            className="
              flex
              flex-wrap
              gap-2
            "
          >

            {[
              "MERN",
              "Placements",
              "DSA",
              "AI",
              "Hackathon",
            ].map((tag) => (

              <button
                key={tag}
                onClick={() =>

                  setSelectedTag(
                    selectedTag === tag
                      ? ""
                      : tag
                  )

                }
                className={`
                  flex
                  items-center
                  gap-1
                  px-3
                  py-1.5
                  rounded-full
                  text-sm
                  font-medium
                  transition
                  hover:scale-105

                  ${
                    selectedTag === tag
                      ? `
                        bg-gradient-to-r
                        from-purple-500
                        to-cyan-400
                        text-white
                      `
                      : `
                        bg-purple-100
                        dark:bg-purple-900/30
                        text-purple-600
                        dark:text-purple-300
                      `
                  }
                `}
              >

                <Hash size={14} />

                {tag}

              </button>

            ))}

          </div>

        </div>

      </motion.div>

      {/* ===================================================== */}
      {/* MAIN CONTENT */}
      {/* ===================================================== */}

      <div className="space-y-8">

        {/* ===================================================== */}
        {/* ADMIN PANEL */}
        {/* ===================================================== */}

        <AnimatePresence>

          {user?.role ===
            "admin" && (

            <motion.div
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
              }}
            >

              <AdminPanel />

            </motion.div>

          )}

        </AnimatePresence>

        {/* ===================================================== */}
        {/* CREATE POST */}
        {/* ===================================================== */}

        <motion.div
          initial={{
            opacity: 0,
            y: 15,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
        >

          <CreatePost
            refresh={(newPost) => {

              setPosts((prev) => [
                newPost,
                ...prev,
              ]);

            }}
          />

        </motion.div>

        {/* ===================================================== */}
        {/* POSTS */}
        {/* ===================================================== */}

        <div
          className="
            space-y-10
          "
        >

          <AnimatePresence>

            {posts.map((post) => (

              <motion.div
                key={post._id}
                initial={{
                  opacity: 0,
                  y: 30,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                transition={{
                  duration: 0.35,
                  ease: "easeOut",
                }}
              >

                <PostCard
                  post={post}
                  updatePost={(
                    updatedPost
                  ) => {

                    setPosts((prev) =>
                      prev.map((p) =>
                        p._id ===
                        updatedPost._id
                          ? updatedPost
                          : p
                      )
                    );

                  }}
                />

              </motion.div>

            ))}

          </AnimatePresence>

        </div>

        {/* ===================================================== */}
        {/* LOADING */}
        {/* ===================================================== */}

        {loading && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="
              space-y-6
            "
          >

            <SkeletonPost />
            <SkeletonPost />

          </motion.div>

        )}

        {/* ===================================================== */}
        {/* EMPTY */}
        {/* ===================================================== */}

        {!loading &&
          posts.length === 0 && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="
              glass
              rounded-3xl
              p-12
              text-center
            "
          >

            <h2
              className="
                text-2xl
                font-bold
                text-black
                dark:text-white
              "
            >
              No posts found 👀
            </h2>

            <p
              className="
                text-gray-600
                dark:text-gray-400
                mt-2
              "
            >
              No posts available for
              this topic yet.
            </p>

          </motion.div>

        )}

        {/* ===================================================== */}
        {/* END */}
        {/* ===================================================== */}

        {!loading &&
          posts.length > 0 &&
          !hasMore && (

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            className="
              text-center
              py-8
              text-gray-500
              dark:text-gray-400
              text-sm
            "
          >
            You’re all caught up ✨
          </motion.div>

        )}

      </div>

    </div>
  );
};

export default Feed;