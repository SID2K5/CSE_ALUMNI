import {
  useState,
} from "react";

import {
  Image,
  Code2,
  Send,
  X,
} from "lucide-react";

import {
  createPost,
} from "../../services/postService";

import toast from "react-hot-toast";

import { motion } from "framer-motion";

const CreatePost = ({
  refresh,
}) => {

  const [content, setContent] =
    useState("");

  const [
    codeSnippet,
    setCodeSnippet,
  ] = useState("");

  /* =====================================================
     MULTIPLE MEDIA
  ===================================================== */

  const [
    selectedFiles,
    setSelectedFiles,
  ] = useState([]);

  const [loading, setLoading] =
    useState(false);

  /* =====================================================
     HANDLE MEDIA
  ===================================================== */

  const handleMedia =
    (e) => {

      const files =
        Array.from(
          e.target.files
        );

      if (
        !files ||
        files.length === 0
      )
        return;

      setSelectedFiles(
        (prev) => [
          ...prev,
          ...files,
        ]
      );

    };

  /* =====================================================
     REMOVE MEDIA
  ===================================================== */

  const removeMedia =
    (index) => {

      setSelectedFiles(
        (prev) =>
          prev.filter(
            (_, i) =>
              i !== index
          )
      );

    };

  /* =====================================================
     SUBMIT
  ===================================================== */

  const handleSubmit =
    async () => {

      try {

        if (
          !content &&
          selectedFiles.length ===
            0 &&
          !codeSnippet
        ) {

          return toast.error(
            "Post cannot be empty"
          );

        }

        setLoading(true);

        /* =====================================================
           HASHTAGS
        ===================================================== */

        const hashtags =
          content.match(
            /#\w+/g
          )?.map((tag) =>
            tag.replace(
              "#",
              ""
            )
          ) || [];

        /* =====================================================
           FORM DATA
        ===================================================== */

        const formData =
          new FormData();

        formData.append(
          "content",
          content
        );

        formData.append(
          "codeSnippet",
          codeSnippet
        );

        /* =====================================================
           MULTIPLE MEDIA
        ===================================================== */

        selectedFiles.forEach(
          (file) => {

            formData.append(
              "media",
              file
            );

          }
        );

        /* =====================================================
           HASHTAGS
        ===================================================== */

        formData.append(
          "hashtags",
          JSON.stringify(
            hashtags
          )
        );

        const { data } =
          await createPost(
            formData
          );

        refresh(data);

        toast.success(
          "Post created 🚀"
        );

        /* =====================================================
           RESET
        ===================================================== */

        setContent("");

        setCodeSnippet("");

        setSelectedFiles([]);

      } catch (error) {

        console.error(error);

        toast.error(
          "Post failed"
        );

      } finally {

        setLoading(false);

      }

    };

  return (

    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="
        glass
        rounded-3xl
        p-5
        border
        border-gray-200
        dark:border-gray-800
        shadow-sm
        space-y-5
      "
    >

      {/* ===================================================== */}
      {/* TEXTAREA */}
      {/* ===================================================== */}

      <textarea
        value={content}
        onChange={(e) =>
          setContent(
            e.target.value
          )
        }
        placeholder="
          Share something with the community...
        "
        className="
          w-full
          min-h-[120px]
          resize-none
          bg-transparent
          text-black
          dark:text-white
          placeholder:text-gray-500
          focus:outline-none
          text-[15px]
        "
      />

      {/* ===================================================== */}
      {/* CODE */}
      {/* ===================================================== */}

      {codeSnippet && (

        <div className="
          bg-black
          rounded-2xl
          p-4
          relative
        ">

          <button
            onClick={() =>
              setCodeSnippet("")
            }
            className="
              absolute
              top-3
              right-3
              text-white
            "
          >

            <X size={16} />

          </button>

          <pre className="
            text-green-400
            text-sm
            overflow-auto
          ">
            {codeSnippet}
          </pre>

        </div>

      )}

      {/* ===================================================== */}
      {/* MEDIA PREVIEW */}
      {/* ===================================================== */}

      {selectedFiles.length >
        0 && (

        <div className="
          flex
          gap-4
          overflow-x-auto
          pb-2
        ">

          {selectedFiles.map(
            (
              file,
              index
            ) => (

              <div
                key={index}
                className="
                  relative
                  min-w-[180px]
                "
              >

                <img
                  src={URL.createObjectURL(
                    file
                  )}
                  className="
                    w-[180px]
                    h-[180px]
                    object-cover
                    rounded-2xl
                    border
                    border-gray-200
                    dark:border-gray-700
                  "
                />

                <button
                  onClick={() =>
                    removeMedia(
                      index
                    )
                  }
                  className="
                    absolute
                    top-2
                    right-2
                    bg-black/60
                    text-white
                    p-2
                    rounded-full
                  "
                >

                  <X
                    size={14}
                  />

                </button>

              </div>

            )
          )}

        </div>

      )}

      {/* ===================================================== */}
      {/* ACTIONS */}
      {/* ===================================================== */}

      <div className="
        flex
        items-center
        justify-between
        flex-wrap
        gap-4
      ">

        {/* LEFT */}

        <div className="
          flex
          items-center
          gap-3
        ">

          {/* MEDIA */}

          <label
            className="
              cursor-pointer
              p-3
              rounded-xl
              hover:bg-gray-100
              dark:hover:bg-gray-800
              transition
            "
          >

            <Image
              className="
                text-purple-500
              "
            />

            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={
                handleMedia
              }
            />

          </label>

          {/* CODE */}

          <button
            onClick={() => {

              const code =
                prompt(
                  "Paste code snippet"
                );

              if (code) {

                setCodeSnippet(
                  code
                );

              }

            }}
            className="
              p-3
              rounded-xl
              hover:bg-gray-100
              dark:hover:bg-gray-800
              transition
            "
          >

            <Code2
              className="
                text-cyan-500
              "
            />

          </button>

        </div>

        {/* POST */}

        <button
          onClick={
            handleSubmit
          }
          disabled={loading}
          className="
            flex
            items-center
            gap-2
            px-5
            py-3
            rounded-2xl
            bg-gradient-to-r
            from-purple-500
            to-cyan-400
            text-white
            font-semibold
            hover:scale-105
            transition
            disabled:opacity-50
          "
        >

          <Send size={18} />

          {
            loading
              ? "Posting..."
              : "Post"
          }

        </button>

      </div>

    </motion.div>

  );

};

export default CreatePost;