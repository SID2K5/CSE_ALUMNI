import API from "./api";

/* =====================================================
   GET FEED
===================================================== */

export const getPosts = async (
  page = 1
) => {

  return await API.get(
    `/posts?page=${page}`
  );

};

/* =====================================================
   CREATE POST
===================================================== */

export const createPost = async (
  formData
) => {

  return await API.post(
    "/posts",
    formData,
    {
      headers: {
        "Content-Type":
          "multipart/form-data",
      },
    }
  );

};

/* =====================================================
   LIKE POST
===================================================== */

export const likePost = async (
  id
) => {

  return await API.put(
    `/posts/like/${id}`
  );

};

/* =====================================================
   REACT POST ❤️🔥🎉
===================================================== */

export const reactPost = async (
  id,
  type
) => {

  return await API.put(
    `/posts/react/${id}`,
    {
      type,
    }
  );

};

/* =====================================================
   COMMENT POST
===================================================== */

export const commentPost =
  async (
    id,
    text
  ) => {

    return await API.post(
      `/posts/comment/${id}`,
      {
        text,
      }
    );

  };

/* =====================================================
   REPLY TO COMMENT
===================================================== */

export const replyToComment =
  async (
    postId,
    commentId,
    text
  ) => {

    return await API.post(
      `/posts/reply/${postId}/${commentId}`,
      {
        text,
      }
    );

  };

/* =====================================================
   DELETE POST 🗑️
===================================================== */

export const deletePost =
  async (id) => {

    return await API.delete(
      `/posts/${id}`
    );

  };

/* =====================================================
   REPORT POST 🚨
===================================================== */

export const reportPost =
  async (id) => {

    return await API.put(
      `/posts/report/${id}`
    );

  };