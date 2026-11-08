import {
  Swiper,
  SwiperSlide,
} from "swiper/react";

import {
  Navigation,
  Pagination,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { useState } from "react";

import {
  likePost,
  commentPost,
  reactPost,
  deletePost,
  reportPost,
} from "../../services/postService";

import { motion, AnimatePresence } from "framer-motion";

import toast from "react-hot-toast";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import {
  Heart,
  MessageCircle,
  Send,
  MoreHorizontal,
  BadgeCheck,
  Flag,
  Trash2,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthContext";

dayjs.extend(relativeTime);

const PostCard = ({
  post,
  updatePost,
}) => {

  const navigate =
    useNavigate();

  const { user } =
    useAuth();

  const [comment, setComment] =
    useState("");

  const [
    showComments,
    setShowComments,
  ] = useState(false);

  const [liked, setLiked] =
    useState(false);

  const [
    animateLike,
    setAnimateLike,
  ] = useState(false);

  const [showMenu, setShowMenu] =
    useState(false);

  /* =====================================================
     LIKE
  ===================================================== */

  const handleLike = async () => {

    try {

      const isLiking = !liked;

      setLiked(isLiking);

      if (isLiking) {

        setAnimateLike(true);

        setTimeout(() => {

          setAnimateLike(false);

        }, 400);

      }

      const { data } =
        await likePost(
          post._id
        );

      updatePost(data);

    } catch (error) {

      console.error(error);

    }

  };

  /* =====================================================
     REACTION
  ===================================================== */

  const handleReaction =
    async (type) => {

      try {

        const { data } =
          await reactPost(
            post._id,
            type
          );

        updatePost(data);

      } catch (error) {

        console.error(error);

      }

    };

  /* =====================================================
     COMMENT
  ===================================================== */

  const handleComment =
    async () => {

      try {

        if (
          !comment.trim()
        )
          return;

        const { data } =
          await commentPost(
            post._id,
            comment
          );

        updatePost(data);

        setComment("");

        toast.success(
          "Comment added 💬"
        );

      } catch (error) {

        console.error(error);

      }

    };

  /* =====================================================
     DELETE
  ===================================================== */

  const handleDelete =
    async () => {

      try {

        await deletePost(
          post._id
        );

        toast.success(
          "Post deleted 🗑️"
        );

        window.location.reload();

      } catch (error) {

        toast.error(
          "Delete failed"
        );

      }

    };

  /* =====================================================
     REPORT
  ===================================================== */

  const handleReport =
    async () => {

      try {

        await reportPost(
          post._id
        );

        toast.success(
          "Post reported 🚨"
        );

      } catch (error) {

        toast.error(
          "Report failed"
        );

      }

    };

  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 20,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        glass
        rounded-3xl
        p-5 md:p-6
        border
        border-gray-200
        dark:border-gray-800
        shadow-sm
        hover:shadow-xl
        transition-all
        duration-300
        space-y-5
      "
    >

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="
        flex
        items-start
        justify-between
      ">

        {/* LEFT */}

        <div className="
          flex gap-3
        ">

          <img
            src={
              post.user
                .profilePic ||
              "https://via.placeholder.com/40"
            }
            className="
              w-12 h-12
              rounded-full
              object-cover
              border
            "
          />

          <div>

            <div className="
              flex
              items-center
              gap-1
            ">

              <h3 className="
                font-semibold
                text-black
                dark:text-white
              ">
                {post.user.name}
              </h3>

              {/* VERIFIED */}

              {(post.user.role ===
                "alumni" ||
                post.user.role ===
                  "admin") && (

                <BadgeCheck
                  size={16}
                  className="
                    text-blue-500
                  "
                />

              )}

            </div>

            <p className="
              text-xs
              text-gray-600
              dark:text-gray-400
            ">

              {dayjs(
                post.createdAt
              ).fromNow()} • 🌐

            </p>

          </div>

        </div>

        {/* RIGHT */}

        <div className="
          relative
        ">

          <MoreHorizontal
            onClick={() =>
              setShowMenu(
                !showMenu
              )
            }
            className="
              cursor-pointer
              text-gray-500
              hover:text-purple-500
              transition
            "
          />

          {/* MENU */}

          <AnimatePresence>

            {showMenu && (

              <motion.div
                initial={{
                  opacity: 0,
                  y: -10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                exit={{
                  opacity: 0,
                }}
                className="
                  absolute
                  right-0
                  mt-2
                  w-44
                  rounded-2xl
                  bg-white
                  dark:bg-[#0f172a]
                  border
                  border-gray-200
                  dark:border-gray-700
                  shadow-2xl
                  z-50
                  overflow-hidden
                "
              >

                {/* DELETE */}

                {(user?._id ===
                  post.user._id ||
                  user?.role ===
                    "admin") && (

                  <button
                    onClick={
                      handleDelete
                    }
                    className="
                      w-full
                      flex
                      items-center
                      gap-2
                      px-4 py-3
                      text-red-500
                      hover:bg-red-50
                      dark:hover:bg-red-900/20
                      transition
                    "
                  >

                    <Trash2
                      size={16}
                    />

                    Delete Post

                  </button>

                )}

                {/* REPORT */}

                <button
                  onClick={
                    handleReport
                  }
                  className="
                    w-full
                    flex
                    items-center
                    gap-2
                    px-4 py-3
                    text-black
                    dark:text-white
                    hover:bg-gray-100
                    dark:hover:bg-gray-800
                    transition
                  "
                >

                  <Flag
                    size={16}
                  />

                  Report Post

                </button>

              </motion.div>

            )}

          </AnimatePresence>

        </div>

      </div>

      {/* ===================================================== */}
      {/* CONTENT */}
      {/* ===================================================== */}

      <div className="
        space-y-3
      ">

        <p className="
          text-[15px]
          leading-relaxed
          text-black
          dark:text-white
          whitespace-pre-wrap
        ">
          {post.content}
        </p>

        {/* HASHTAGS */}

        {post.hashtags
          ?.length > 0 && (

          <div className="
            flex
            flex-wrap
            gap-2
          ">

            {post.hashtags.map(
              (tag, i) => (

                <span
                  key={i}
                  className="
                    text-sm
                    font-medium
                    text-purple-500
                    hover:underline
                    cursor-pointer
                  "
                >
                  #{tag}
                </span>

              )
            )}

          </div>

        )}

      </div>

      {/* ===================================================== */}
{/* MEDIA SLIDER */}
{/* ===================================================== */}

{(post.image ||
  post.media?.length > 0) && (

  <div className="
    mt-2
    rounded-3xl
    overflow-hidden
    border
    border-gray-200
    dark:border-gray-800
    bg-black
  ">

    <Swiper
      modules={[
        Navigation,
        Pagination,
      ]}
      navigation
      pagination={{
        clickable: true,
      }}
      slidesPerView={1}
      spaceBetween={0}
      className="
        rounded-3xl
      "
    >

      {/* OLD SINGLE IMAGE */}

      {post.image &&
        post.media?.length ===
          0 && (

        <SwiperSlide>

          <img
            src={post.image}
            className="
              w-full
              max-h-[650px]
              object-contain
              bg-black
            "
          />

        </SwiperSlide>

      )}

      {/* MULTIPLE MEDIA */}

      {post.media?.map(
        (
          media,
          index
        ) => (

          <SwiperSlide
            key={index}
          >

            {/* VIDEO */}

            {media.match(
              /\.(mp4|webm|ogg)$/i
            ) ? (

              <video
                controls
                className="
                  w-full
                  max-h-[650px]
                  object-contain
                  bg-black
                "
              >

                <source
                  src={media}
                />

              </video>

            ) : (

              /* IMAGE */

              <img
                src={media}
                alt=""
                className="
                  w-full
                  max-h-[650px]
                  object-contain
                  bg-black
                "
              />

            )}

          </SwiperSlide>

        )
      )}

    </Swiper>

  </div>

)}

      {/* ===================================================== */}
      {/* STATS */}
      {/* ===================================================== */}

      <div className="
        flex
        justify-between
        text-sm
        text-gray-600
        dark:text-gray-400
        border-b
        border-gray-200
        dark:border-gray-800
        pb-3
      ">

        <div className="
          flex gap-4
        ">

          <span>
            ❤️{" "}
            {post.reactions
              ?.heart
              ?.length || 0}
          </span>

          <span>
            🔥{" "}
            {post.reactions
              ?.fire
              ?.length || 0}
          </span>

          <span>
            🎉{" "}
            {post.reactions
              ?.celebrate
              ?.length || 0}
          </span>

          <span>
            👍{" "}
            {post.likes
              ?.length || 0}
          </span>

        </div>

        <span>
          💬{" "}
          {post.comments
            ?.length || 0}
        </span>

      </div>

      {/* ===================================================== */}
      {/* ACTIONS */}
      {/* ===================================================== */}

      <div className="
        flex
        justify-between
        items-center
        flex-wrap
        gap-4
      ">

        {/* LEFT */}

        <div className="
          flex
          gap-2
          flex-wrap
        ">

          {/* LIKE */}

          <button
            onClick={
              handleLike
            }
            className="
              flex
              items-center
              gap-2
              px-3 py-2
              rounded-xl
              hover:bg-gray-100
              dark:hover:bg-gray-800
              transition
            "
          >

            <motion.div
              animate={
                animateLike
                  ? {
                      scale: [
                        1,
                        1.4,
                        1,
                      ],
                    }
                  : {}
              }
              className={
                liked
                  ? "text-red-500"
                  : ""
              }
            >

              <Heart
                size={18}
              />

            </motion.div>

            <span className="
              text-black
              dark:text-white
            ">
              Like
            </span>

          </button>

          {/* REACTIONS */}

          {[
            "heart",
            "fire",
            "celebrate",
          ].map((type) => (

            <button
              key={type}
              onClick={() =>
                handleReaction(
                  type
                )
              }
              className="
                px-3 py-2
                rounded-xl
                hover:bg-gray-100
                dark:hover:bg-gray-800
              "
            >

              {type ===
                "heart" &&
                "❤️"}

              {type ===
                "fire" &&
                "🔥"}

              {type ===
                "celebrate" &&
                "🎉"}

            </button>

          ))}

          {/* COMMENT */}

          <button
            onClick={() =>
              setShowComments(
                !showComments
              )
            }
            className="
              flex
              items-center
              gap-2
              px-3 py-2
              rounded-xl
              hover:bg-gray-100
              dark:hover:bg-gray-800
              transition
            "
          >

            <MessageCircle
              size={18}
            />

            <span className="
              text-black
              dark:text-white
            ">
              Comment
            </span>

          </button>

        </div>

        {/* SHARE */}

        <button
          onClick={() =>
            navigate(
              `/chat?post=${post._id}`
            )
          }
          className="
            flex
            items-center
            gap-2
            px-3 py-2
            rounded-xl
            hover:bg-gray-100
            dark:hover:bg-gray-800
          "
        >

          <Send size={18} />

          <span className="
            text-black
            dark:text-white
          ">
            Share
          </span>

        </button>

      </div>

      {/* ===================================================== */}
      {/* COMMENTS */}
      {/* ===================================================== */}

      <AnimatePresence>

        {showComments && (

          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            exit={{
              opacity: 0,
              height: 0,
            }}
            className="
              space-y-3
            "
          >

            {/* COMMENTS */}

            {post.comments.map(
              (c, i) => (

                <div
                  key={i}
                  className="
                    bg-gray-100
                    dark:bg-[#0f172a]
                    px-4 py-3
                    rounded-2xl
                  "
                >

                  <div className="
                    flex
                    items-center
                    gap-2
                    mb-2
                  ">

                    <img
                      src={
                        c.user
                          ?.profilePic ||
                        "https://via.placeholder.com/30"
                      }
                      className="
                        w-8 h-8
                        rounded-full
                        object-cover
                      "
                    />

                    <div>

                      <h4 className="
                        text-sm
                        font-semibold
                        text-black
                        dark:text-white
                      ">
                        {
                          c.user
                            ?.name
                        }
                      </h4>

                      <p className="
                        text-xs
                        text-gray-500
                      ">
                        {dayjs(
                          c.createdAt
                        ).fromNow()}
                      </p>

                    </div>

                  </div>

                  <p className="
                    text-black
                    dark:text-white
                    text-sm
                    leading-relaxed
                  ">
                    {c.text}
                  </p>

                </div>

              )
            )}

            {/* COMMENT INPUT */}

            <div className="
              flex gap-2
              pt-2
            ">

              <input
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value
                  )
                }
                placeholder="Write a comment..."
                className="
                  flex-1
                  px-4 py-3
                  rounded-2xl
                  bg-gray-100
                  dark:bg-[#0f172a]
                  text-black
                  dark:text-white
                  focus:outline-none
                "
              />

              <button
                onClick={
                  handleComment
                }
                className="
                  px-5 py-3
                  rounded-2xl
                  bg-gradient-to-r
                  from-purple-500
                  to-cyan-400
                  text-white
                  font-medium
                  hover:scale-105
                  transition
                "
              >
                Post
              </button>

            </div>

          </motion.div>

        )}

      </AnimatePresence>

    </motion.div>

  );
};

export default PostCard;