import User from "../models/User.js";

/* =====================================================
   GENERATE REPORT
===================================================== */

export const generateReport =
  async (req, res) => {

    try {

      const {
        company,
        location,
        graduationYear,
      } = req.query;

      let query = {};

      /* =========================================
         COMPANY FILTER
      ========================================= */

      if (company) {

        query.company = {
          $in:
            company.split(","),
        };

      }

      /* =========================================
         LOCATION FILTER
      ========================================= */

      if (location) {

        query.location = {
          $in:
            location.split(","),
        };

      }

      /* =========================================
         YEAR FILTER
      ========================================= */

      if (graduationYear) {

        query.graduationYear = {
          $in:
            graduationYear
              .split(",")
              .map(Number),
        };

      }

      /* =========================================
         FETCH USERS
      ========================================= */

      const users =
        await User.find(query)
          .select(
            `
            name
            email
            company
            location
            graduationYear
            role
            `
          )
          .sort({
            graduationYear: -1,
          });

      res.json(users);

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }

  };

/* =====================================================
   GET FILTER OPTIONS
===================================================== */

export const getReportFilters =
  async (req, res) => {

    try {

      /* =========================================
         DISTINCT VALUES
      ========================================= */

      const companies =
        await User.distinct(
          "company"
        );

      const locations =
        await User.distinct(
          "location"
        );

      const years =
        await User.distinct(
          "graduationYear"
        );

      /* =========================================
         CLEAN EMPTY VALUES
      ========================================= */

      res.json({

        companies:
          companies
            .filter(Boolean)
            .sort(),

        locations:
          locations
            .filter(Boolean)
            .sort(),

        years:
          years
            .filter(Boolean)
            .sort(
              (a, b) => b - a
            ),

      });

    } catch (error) {

      res.status(500).json({
        message:
          error.message,
      });

    }

  };