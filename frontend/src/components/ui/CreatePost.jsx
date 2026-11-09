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
      className="card p-4 sm:p-5 space-y-4"
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
        placeholder="Share something with the community…"
        className="
          w-full min-h-[96px] resize-none bg-transparent
          text-ink placeholder:text-muted
          focus:outline-none text-[15px] leading-relaxed
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

          <label className="icon-btn cursor-pointer" title="Add photos">
            <Image size={20} className="text-brand" />
            <input
              type="file"
              multiple
              accept="image/*"
              hidden
              onChange={handleMedia}
            />
          </label>

          {/* CODE */}

          <button
            onClick={() => {
              const code = prompt("Paste code snippet");
              if (code) setCodeSnippet(code);
            }}
            className="icon-btn"
            title="Add code snippet"
          >
            <Code2 size={20} className="text-brand-2" />
          </button>

        </div>

        {/* POST */}

        <button onClick={handleSubmit} disabled={loading} className="btn-primary">
          <Send size={18} />
          {loading ? "Posting…" : "Post"}
        </button>

      </div>

    </motion.div>

  );

};

export default CreatePost;