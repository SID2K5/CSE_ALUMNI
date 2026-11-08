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

    <div className="w-full max-w-content mx-auto">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="
          sticky top-[72px] z-20
          backdrop-blur-xl bg-bg/80
          -mx-4 sm:mx-0 px-4 sm:px-0
          pt-3 pb-4 mb-6
          border-b border-line sm:border-none
        "
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Sparkles className="text-brand" size={24} />
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-ink">
                Your Feed
              </h1>
              <p className="text-muted text-sm hidden sm:block">
                Students, alumni &amp; opportunities
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-muted font-semibold text-sm">
            <TrendingUp size={16} className="text-brand-2" />
            Trending
          </div>
        </div>

        {/* TRENDING TAGS */}
        <div className="flex flex-nowrap sm:flex-wrap gap-2 mt-4 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0">
          {["MERN", "Placements", "DSA", "AI", "Hackathon"].map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? "" : tag)}
              className={`chip shrink-0 ${selectedTag === tag ? "chip-active" : ""}`}
            >
              <Hash size={13} />
              {tag}
            </button>
          ))}
        </div>
      </motion.div>

      {/* ===================================================== */}
      {/* MAIN CONTENT */}
      {/* ===================================================== */}

      <div className="space-y-5">

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

        <div className="space-y-5">

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