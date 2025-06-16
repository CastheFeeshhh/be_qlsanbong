import db from "../models/index";

const getAllNews = () => {
  return new Promise(async (resolve, reject) => {
    try {
      let news = await db.News.findAll({
        where: { is_published: 1 },
        attributes: ["news_id", "title", "summary", "media_url", "created_at"],
        include: [
          {
            model: db.User,
            attributes: ["first_name", "last_name"],
          },
        ],
        order: [["created_at", "DESC"]],
        raw: true,
        nest: true,
      });
      resolve({
        errCode: 0,
        data: news,
      });
    } catch (e) {
      reject(e);
    }
  });
};

const getNewsById = (newsId) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!newsId) {
        resolve({
          errCode: 1,
          errMessage: "Thiếu tham số bắt buộc: id",
        });
        return;
      }
      let news = await db.News.findOne({
        where: {
          news_id: newsId,
          is_published: 1,
        },
        include: [
          {
            model: db.User,
            attributes: ["first_name", "last_name"],
          },
        ],
        raw: false,
      });

      if (news) {
        resolve({
          errCode: 0,
          data: news,
        });
      } else {
        resolve({
          errCode: 2,
          errMessage: "Không tìm thấy bài viết.",
        });
      }
    } catch (e) {
      reject(e);
    }
  });
};

module.exports = {
  getAllNews,
  getNewsById,
};
