import {
  useEffect,
  useState,
} from "react";

import API from "../../services/api";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  Shield,
  Users,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  GraduationCap,
  FileText,
} from "lucide-react";

import { motion } from "framer-motion";

import toast from "react-hot-toast";

import AdminJobs from "../../components/admin/AdminJobs";

/* PDF + EXCEL */

import jsPDF from "jspdf";

import autoTable from "jspdf-autotable";

import * as XLSX from "xlsx";

import { saveAs } from "file-saver";

/* MULTI SELECT */

import Select from "react-select";

const AdminDashboard = () => {

  /* =====================================================
     STATES
  ===================================================== */

  const [users, setUsers] =
    useState([]);

  const [stats, setStats] =
    useState([]);

  const [
    dashboardStats,
    setDashboardStats,
  ] = useState(null);

  const [
    reportedPosts,
    setReportedPosts,
  ] = useState([]);

  /* REPORT FILTERS */

  const [
    reportFilters,
    setReportFilters,
  ] = useState({
    company: [],
    location: [],
    graduationYear: [],
  });

  const [
    filterOptions,
    setFilterOptions,
  ] = useState({
    companies: [],
    locations: [],
    years: [],
  });

  const [
    reportData,
    setReportData,
  ] = useState([]);

  const [
    loadingReport,
    setLoadingReport,
  ] = useState(false);

  /* =====================================================
     FETCH DATA
  ===================================================== */

  const fetchData =
    async () => {

      try {

        const [
          u,
          s,
          d,
          r,
          filters,
        ] = await Promise.all([

          API.get(
            "/admin/pending-users"
          ),

          API.get(
            "/alumni/stats"
          ),

          API.get(
            "/admin/stats"
          ),

          API.get(
            "/admin/reported-posts"
          ),

          API.get(
            "/reports/filters"
          ),

        ]);

        setUsers(u.data);

        setStats(s.data);

        setDashboardStats(
          d.data
        );

        setReportedPosts(
          r.data
        );

        setFilterOptions(
          filters.data
        );

      } catch (error) {

        console.error(error);

      }

    };

  /* =====================================================
     APPROVE USER
  ===================================================== */

  const approve =
    async (id, role) => {

      try {

        await API.put(
          `/admin/approve/${id}`,
          { role }
        );

        toast.success(
          "User approved ✅"
        );

        fetchData();

      } catch {

        toast.error(
          "Approval failed"
        );

      }

    };

  /* =====================================================
     REJECT USER
  ===================================================== */

  const reject =
    async (id) => {

      try {

        await API.delete(
          `/admin/reject/${id}`
        );

        toast.success(
          "User rejected ❌"
        );

        fetchData();

      } catch {

        toast.error(
          "Action failed"
        );

      }

    };

  /* =====================================================
     DELETE REPORTED POST
  ===================================================== */

  const deleteReportedPost =
    async (id) => {

      try {

        await API.delete(
          `/admin/post/${id}`
        );

        toast.success(
          "Post deleted 🚨"
        );

        fetchData();

      } catch {

        toast.error(
          "Delete failed"
        );

      }

    };

  /* =====================================================
     IGNORE REPORT
  ===================================================== */

  const ignoreReport =
    async (id) => {

      try {

        await API.put(
          `/admin/ignore-report/${id}`
        );

        toast.success(
          "Report ignored"
        );

        fetchData();

      } catch {

        toast.error(
          "Action failed"
        );

      }

    };

  /* =====================================================
     GENERATE REPORT
  ===================================================== */

  const generateReport =
    async () => {

      try {

        setLoadingReport(true);

        const query =
          new URLSearchParams();

        /* COMPANY */

        if (
          reportFilters.company
            .length
        ) {

          query.append(
            "company",
            reportFilters.company
              .map(
                (c) =>
                  c.value
              )
              .join(",")
          );

        }

        /* LOCATION */

        if (
          reportFilters.location
            .length
        ) {

          query.append(
            "location",
            reportFilters.location
              .map(
                (l) =>
                  l.value
              )
              .join(",")
          );

        }

        /* YEAR */

        if (
          reportFilters
            .graduationYear
            .length
        ) {

          query.append(
            "graduationYear",
            reportFilters.graduationYear
              .map(
                (y) =>
                  y.value
              )
              .join(",")
          );

        }

        const { data } =
          await API.get(
            `/reports/generate?${query.toString()}`
          );

        setReportData(data);

        toast.success(
          "Report generated 🚀"
        );

      } catch {

        toast.error(
          "Report generation failed"
        );

      }

      setLoadingReport(false);

    };

  /* =====================================================
     EXPORT PDF
  ===================================================== */

  const exportPDF = () => {

    if (
      reportData.length === 0
    ) {

      toast.error(
        "Generate report first"
      );

      return;

    }

    const doc =
      new jsPDF();

    doc.setFontSize(18);

    doc.text(
      "ALU Alumni Report",
      14,
      20
    );

    doc.setFontSize(11);

    doc.text(
      `Generated on: ${new Date().toLocaleString()}`,
      14,
      30
    );

    autoTable(doc, {

      startY: 40,

      head: [[
        "Name",
        "Email",
        "Company",
        "Location",
        "Passout Year",
        "Role",
      ]],

      body: reportData.map(
        (u) => [
          u.name,
          u.email,
          u.company,
          u.location,
          u.graduationYear,
          u.role,
        ]
      ),

      styles: {
        fontSize: 10,
        cellPadding: 3,
      },

      headStyles: {
        fillColor: [
          124,
          58,
          237,
        ],
      },

    });

    doc.save(
      "ALU_Report.pdf"
    );

    toast.success(
      "PDF exported 🚀"
    );

  };
    /* =====================================================
     EXPORT EXCEL
  ===================================================== */

  const exportExcel = () => {

    if (
      reportData.length === 0
    ) {

      toast.error(
        "Generate report first"
      );

      return;

    }

    const formattedData =
      reportData.map(
        (u) => ({
          Name: u.name,
          Email: u.email,
          Company: u.company,
          Location: u.location,
          PassoutYear:
            u.graduationYear,
          Role: u.role,
        })
      );

    const worksheet =
      XLSX.utils.json_to_sheet(
        formattedData
      );

    const workbook =
      XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      workbook,
      worksheet,
      "Report"
    );

    const excelBuffer =
      XLSX.write(
        workbook,
        {
          bookType: "xlsx",
          type: "array",
        }
      );

    const data =
      new Blob(
        [excelBuffer],
        {
          type:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
        }
      );

    saveAs(
      data,
      "ALU_Report.xlsx"
    );

    toast.success(
      "Excel exported 📊"
    );

  };

  /* =====================================================
     EFFECT
  ===================================================== */

  useEffect(() => {

    fetchData();

  }, []);

  /* =====================================================
     RETURN
  ===================================================== */

  return (

    <div className="
      max-w-7xl
      mx-auto
      space-y-8
    ">

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: -10,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="
          flex
          items-center
          justify-between
        "
      >

        <div>

          <h1 className="
            text-4xl
            font-black
            gradient-text
            flex
            items-center
            gap-3
          ">

            <Shield
              className="
                text-purple-500
              "
            />

            Admin Dashboard

          </h1>

          <p className="
            text-gray-600
            dark:text-gray-400
            mt-2
          ">
            Manage users,
            reports,
            jobs &
            approvals 🚀
          </p>

        </div>

      </motion.div>

      {/* ===================================================== */}
      {/* STATS */}
      {/* ===================================================== */}

      {dashboardStats && (

        <div className="
          grid
          grid-cols-2
          md:grid-cols-4
          gap-5
        ">

          {/* USERS */}

          <div className="
            glass
            rounded-3xl
            p-5
            border
            border-purple-200
            dark:border-purple-900
          ">

            <Users
              className="
                text-purple-500
                mb-3
              "
            />

            <h3 className="
              text-3xl
              font-black
              text-black
              dark:text-white
            ">
              {
                dashboardStats.users
              }
            </h3>

            <p className="
              text-gray-500
              text-sm
            ">
              Total Users
            </p>

          </div>

          {/* POSTS */}

          <div className="
            glass
            rounded-3xl
            p-5
            border
            border-cyan-200
            dark:border-cyan-900
          ">

            <Briefcase
              className="
                text-cyan-500
                mb-3
              "
            />

            <h3 className="
              text-3xl
              font-black
              text-black
              dark:text-white
            ">
              {
                dashboardStats.posts
              }
            </h3>

            <p className="
              text-gray-500
              text-sm
            ">
              Total Posts
            </p>

          </div>

          {/* PENDING */}

          <div className="
            glass
            rounded-3xl
            p-5
            border
            border-yellow-200
            dark:border-yellow-900
          ">

            <GraduationCap
              className="
                text-yellow-500
                mb-3
              "
            />

            <h3 className="
              text-3xl
              font-black
              text-black
              dark:text-white
            ">
              {
                dashboardStats.pendingUsers
              }
            </h3>

            <p className="
              text-gray-500
              text-sm
            ">
              Pending Users
            </p>

          </div>

          {/* REPORTS */}

          <div className="
            glass
            rounded-3xl
            p-5
            border
            border-red-200
            dark:border-red-900
          ">

            <AlertTriangle
              className="
                text-red-500
                mb-3
              "
            />

            <h3 className="
              text-3xl
              font-black
              text-black
              dark:text-white
            ">
              {
                dashboardStats.reportedPosts
              }
            </h3>

            <p className="
              text-gray-500
              text-sm
            ">
              Reported Posts
            </p>

          </div>

        </div>

      )}

      {/* ===================================================== */}
      {/* GRID */}
      {/* ===================================================== */}

      <div className="
        grid
        grid-cols-1
        lg:grid-cols-2
        gap-6
      ">

        {/* ===================================================== */}
        {/* CHART */}
        {/* ===================================================== */}

        <div className="
          glass
          p-6
          rounded-3xl
        ">

          <h2 className="
            font-bold
            text-xl
            mb-5
            text-black
            dark:text-white
          ">
            Top Companies
          </h2>

          <ResponsiveContainer
            width="100%"
            height={280}
          >

            <BarChart
              data={stats}
            >

              <XAxis
                dataKey="_id"
              />

              <YAxis />

              <Tooltip />

              <Bar
                dataKey="count"
                fill="#7C3AED"
                radius={[
                  10,
                  10,
                  0,
                  0,
                ]}
              />

            </BarChart>

          </ResponsiveContainer>

        </div>

        {/* ===================================================== */}
        {/* JOBS */}
        {/* ===================================================== */}

        <AdminJobs />

      </div>
            {/* ===================================================== */}
      {/* REPORT GENERATOR */}
      {/* ===================================================== */}

      <div className="
        glass
        p-6
        rounded-3xl
        space-y-6
      ">

        {/* HEADER */}

        <div className="
          flex
          items-center
          gap-3
        ">

          <FileText
            className="
              text-purple-500
            "
          />

          <h2 className="
            text-2xl
            font-bold
            text-black
            dark:text-white
          ">
            Generate Reports
          </h2>

        </div>

        {/* FILTERS */}

        <div className="
          grid
          grid-cols-1
          md:grid-cols-3
          gap-4
        ">

          {/* COMPANY */}

          <Select
            isMulti

            menuPortalTarget={
              document.body
            }

            menuPosition="fixed"

            options={
              filterOptions.companies.map(
                (c) => ({
                  label: c,
                  value: c,
                })
              )
            }

            placeholder="Select Companies"

            onChange={(selected) =>
              setReportFilters({
                ...reportFilters,
                company:
                  selected,
              })
            }

            styles={{

              control: (
                base
              ) => ({
                ...base,
                backgroundColor:
                  "#111827",
                borderColor:
                  "#374151",
                borderRadius:
                  "16px",
                minHeight:
                  "54px",
                boxShadow:
                  "none",
                color:
                  "white",
              }),

              menu: (
                base
              ) => ({
                ...base,
                backgroundColor:
                  "#111827",
                borderRadius:
                  "16px",
                overflow:
                  "hidden",
                zIndex:
                  9999,
              }),

              menuList: (
                base
              ) => ({
                ...base,
                backgroundColor:
                  "#111827",
                padding: 0,
              }),

              option: (
                base,
                state
              ) => ({
                ...base,

                backgroundColor:
                  state.isFocused
                    ? "#7C3AED"
                    : "#111827",

                color:
                  "white",

                cursor:
                  "pointer",

                padding: 12,
              }),

              multiValue: (
                base
              ) => ({
                ...base,

                background:
                  "linear-gradient(to right,#7C3AED,#06B6D4)",

                borderRadius:
                  "10px",
              }),

              multiValueLabel:
                (
                  base
                ) => ({
                  ...base,
                  color:
                    "white",
                  fontWeight:
                    600,
                }),

              multiValueRemove:
                (
                  base
                ) => ({
                  ...base,
                  color:
                    "white",

                  ":hover": {
                    backgroundColor:
                      "#EF4444",

                    color:
                      "white",
                  },
                }),

              input: (
                base
              ) => ({
                ...base,
                color:
                  "white",
              }),

              placeholder:
                (
                  base
                ) => ({
                  ...base,
                  color:
                    "#9CA3AF",
                }),

            }}
          />

          {/* LOCATION */}

          <Select
            isMulti

            menuPortalTarget={
              document.body
            }

            menuPosition="fixed"

            options={
              filterOptions.locations.map(
                (l) => ({
                  label: l,
                  value: l,
                })
              )
            }

            placeholder="Select Locations"

            onChange={(selected) =>
              setReportFilters({
                ...reportFilters,
                location:
                  selected,
              })
            }

            styles={{

              control: (
                base
              ) => ({
                ...base,
                backgroundColor:
                  "#111827",
                borderColor:
                  "#374151",
                borderRadius:
                  "16px",
                minHeight:
                  "54px",
                boxShadow:
                  "none",
              }),

              menu: (
                base
              ) => ({
                ...base,
                backgroundColor:
                  "#111827",
                borderRadius:
                  "16px",
                overflow:
                  "hidden",
                zIndex:
                  9999,
              }),

              option: (
                base,
                state
              ) => ({
                ...base,

                backgroundColor:
                  state.isFocused
                    ? "#7C3AED"
                    : "#111827",

                color:
                  "white",

                cursor:
                  "pointer",
              }),

              multiValue: (
                base
              ) => ({
                ...base,

                background:
                  "linear-gradient(to right,#7C3AED,#06B6D4)",

                borderRadius:
                  "10px",
              }),

              multiValueLabel:
                (
                  base
                ) => ({
                  ...base,
                  color:
                    "white",
                }),

              multiValueRemove:
                (
                  base
                ) => ({
                  ...base,
                  color:
                    "white",

                  ":hover": {
                    backgroundColor:
                      "#EF4444",

                    color:
                      "white",
                  },
                }),

              input: (
                base
              ) => ({
                ...base,
                color:
                  "white",
              }),

              placeholder:
                (
                  base
                ) => ({
                  ...base,
                  color:
                    "#9CA3AF",
                }),

            }}
          />
                    {/* YEAR */}

          <Select
            isMulti

            menuPortalTarget={
              document.body
            }

            menuPosition="fixed"

            options={
              filterOptions.years.map(
                (y) => ({
                  label: y,
                  value: y,
                })
              )
            }

            placeholder="Select Passout Years"

            onChange={(selected) =>
              setReportFilters({
                ...reportFilters,
                graduationYear:
                  selected,
              })
            }

            styles={{

              control: (
                base
              ) => ({
                ...base,
                backgroundColor:
                  "#111827",
                borderColor:
                  "#374151",
                borderRadius:
                  "16px",
                minHeight:
                  "54px",
                boxShadow:
                  "none",
              }),

              menu: (
                base
              ) => ({
                ...base,
                backgroundColor:
                  "#111827",
                borderRadius:
                  "16px",
                overflow:
                  "hidden",
                zIndex:
                  9999,
              }),

              option: (
                base,
                state
              ) => ({
                ...base,

                backgroundColor:
                  state.isFocused
                    ? "#7C3AED"
                    : "#111827",

                color:
                  "white",

                cursor:
                  "pointer",
              }),

              multiValue: (
                base
              ) => ({
                ...base,

                background:
                  "linear-gradient(to right,#7C3AED,#06B6D4)",

                borderRadius:
                  "10px",
              }),

              multiValueLabel:
                (
                  base
                ) => ({
                  ...base,
                  color:
                    "white",
                }),

              multiValueRemove:
                (
                  base
                ) => ({
                  ...base,
                  color:
                    "white",

                  ":hover": {
                    backgroundColor:
                      "#EF4444",

                    color:
                      "white",
                  },
                }),

              input: (
                base
              ) => ({
                ...base,
                color:
                  "white",
              }),

              placeholder:
                (
                  base
                ) => ({
                  ...base,
                  color:
                    "#9CA3AF",
                }),

            }}
          />

        </div>

        {/* ===================================================== */}
        {/* BUTTONS */}
        {/* ===================================================== */}

        <div className="
          flex
          flex-wrap
          gap-3
        ">

          {/* GENERATE */}

          <button
            onClick={
              generateReport
            }
            className="
              btn-primary
              px-6
              py-3
              rounded-2xl
            "
          >

            {loadingReport
              ? "Generating..."
              : "Generate Report"}

          </button>

          {/* PDF */}

          <button
            onClick={
              exportPDF
            }
            className="
              px-6
              py-3
              rounded-2xl
              bg-red-500
              text-white
              hover:scale-105
              transition
            "
          >
            Export PDF
          </button>

          {/* EXCEL */}

          <button
            onClick={
              exportExcel
            }
            className="
              px-6
              py-3
              rounded-2xl
              bg-green-500
              text-white
              hover:scale-105
              transition
            "
          >
            Export Excel
          </button>

        </div>

        {/* ===================================================== */}
        {/* REPORT RESULTS */}
        {/* ===================================================== */}

        {reportData.length > 0 && (

          <div className="
            overflow-x-auto
          ">

            <table className="
              w-full
              border-collapse
            ">

              <thead>

                <tr className="
                  border-b
                  border-gray-300
                  dark:border-gray-700
                ">

                  <th className="
                    py-3
                    text-left
                  ">
                    Name
                  </th>

                  <th className="
                    py-3
                    text-left
                  ">
                    Email
                  </th>

                  <th className="
                    py-3
                    text-left
                  ">
                    Company
                  </th>

                  <th className="
                    py-3
                    text-left
                  ">
                    Location
                  </th>

                  <th className="
                    py-3
                    text-left
                  ">
                    Year
                  </th>

                  <th className="
                    py-3
                    text-left
                  ">
                    Role
                  </th>

                </tr>

              </thead>

              <tbody>

                {reportData.map(
                  (user) => (

                    <tr
                      key={user._id}
                      className="
                        border-b
                        border-gray-200
                        dark:border-gray-800
                      "
                    >

                      <td className="
                        py-3
                      ">
                        {user.name}
                      </td>

                      <td className="
                        py-3
                      ">
                        {user.email}
                      </td>

                      <td className="
                        py-3
                      ">
                        {user.company}
                      </td>

                      <td className="
                        py-3
                      ">
                        {user.location}
                      </td>

                      <td className="
                        py-3
                      ">
                        {
                          user.graduationYear
                        }
                      </td>

                      <td className="
                        py-3
                        capitalize
                      ">
                        {user.role}
                      </td>

                    </tr>

                  )
                )}

              </tbody>

            </table>

          </div>

        )}

      </div>
            {/* ===================================================== */}
      {/* USER APPROVALS */}
      {/* ===================================================== */}

      <div className="
        glass
        p-6
        rounded-3xl
        space-y-5
      ">

        <h2 className="
          text-2xl
          font-bold
          text-black
          dark:text-white
        ">
          Pending Users 👥
        </h2>

        {users.length === 0 && (

          <p className="
            text-gray-500
          ">
            No pending users
          </p>

        )}

        {users.map((u) => (

          <div
            key={u._id}
            className="
              flex
              flex-col
              lg:flex-row
              lg:items-center
              lg:justify-between
              gap-4
              border-b
              border-gray-200
              dark:border-gray-800
              pb-4
            "
          >

            {/* USER */}

            <div>

              <h3 className="
                font-semibold
                text-black
                dark:text-white
              ">
                {u.name}
              </h3>

              <p className="
                text-sm
                text-gray-500
              ">
                {u.email}
              </p>

            </div>

            {/* ACTIONS */}

            <div className="
              flex
              flex-wrap
              gap-2
            ">

              <button
                onClick={() =>
                  approve(
                    u._id,
                    "student"
                  )
                }
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-purple-500
                  text-white
                  hover:scale-105
                  transition
                "
              >
                Student
              </button>

              <button
                onClick={() =>
                  approve(
                    u._id,
                    "alumni"
                  )
                }
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-cyan-500
                  text-white
                  hover:scale-105
                  transition
                "
              >
                Alumni
              </button>

              <button
                onClick={() =>
                  approve(
                    u._id,
                    "admin"
                  )
                }
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-yellow-500
                  text-white
                  hover:scale-105
                  transition
                "
              >
                Admin
              </button>

              <button
                onClick={() =>
                  reject(u._id)
                }
                className="
                  px-4
                  py-2
                  rounded-xl
                  bg-red-500
                  text-white
                  hover:scale-105
                  transition
                "
              >
                Reject
              </button>

            </div>

          </div>

        ))}

      </div>

      {/* ===================================================== */}
      {/* REPORTED POSTS */}
      {/* ===================================================== */}

      <div className="
        glass
        p-6
        rounded-3xl
        space-y-5
      ">

        <h2 className="
          text-2xl
          font-bold
          text-red-500
          flex
          items-center
          gap-2
        ">

          <AlertTriangle />

          Reported Posts

        </h2>

        {reportedPosts.length ===
          0 && (

          <p className="
            text-gray-500
          ">
            No reported posts 🚀
          </p>

        )}

        {reportedPosts.map(
          (post) => (

            <div
              key={post._id}
              className="
                border
                border-red-200
                dark:border-red-900
                rounded-2xl
                p-5
                space-y-4
              "
            >

              {/* TOP */}

              <div className="
                flex
                justify-between
                items-start
              ">

                <div>

                  <h3 className="
                    font-semibold
                    text-black
                    dark:text-white
                  ">
                    {
                      post.user
                        ?.name
                    }
                  </h3>

                  <p className="
                    text-sm
                    text-red-500
                  ">
                    {
                      post.reports
                        ?.length
                    }
                    {" "}
                    reports
                  </p>

                </div>

              </div>

              {/* CONTENT */}

              <p className="
                text-black
                dark:text-white
              ">
                {post.content}
              </p>

              {/* ACTIONS */}

              <div className="
                flex
                gap-3
              ">

                <button
                  onClick={() =>
                    deleteReportedPost(
                      post._id
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-xl
                    bg-red-500
                    text-white
                    hover:scale-105
                    transition
                  "
                >

                  <XCircle
                    size={16}
                  />

                  Delete

                </button>

                <button
                  onClick={() =>
                    ignoreReport(
                      post._id
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    px-4
                    py-2
                    rounded-xl
                    bg-gray-300
                    dark:bg-gray-700
                    text-black
                    dark:text-white
                    hover:scale-105
                    transition
                  "
                >

                  <CheckCircle2
                    size={16}
                  />

                  Ignore

                </button>

              </div>

            </div>

          )
        )}

      </div>

    </div>

  );

};

export default AdminDashboard;