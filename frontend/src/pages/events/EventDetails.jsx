import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../../services/api";
import dayjs from "dayjs";

import { motion } from "framer-motion";

import {
  CalendarDays,
  MapPin,
  Users,
  Clock3,
  BadgeCheck,
  GraduationCap,
  Sparkles,
} from "lucide-react";

const EventDetails = () => {

  const { id } = useParams();

  const [event, setEvent] =
    useState(null);

  /* =====================================================
     FETCH EVENT
  ===================================================== */
  const fetchEvent = async () => {

    try {

      const { data } =
        await API.get(
          `/events/${id}`
        );

      setEvent(data);

    } catch (error) {

      console.error(error);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, []);

  if (!event) {

    return (

      <div className="min-h-screen flex items-center justify-center text-white">

        Loading...

      </div>

    );
  }

  const daysLeft =
    dayjs(
      event.endDate ||
        event.date
    ).diff(dayjs(), "day");

  return (

    <div className="relative w-full max-w-[1250px] mx-auto pb-24">

      {/* ===================================================== */}
      {/* BACKGROUND EFFECTS */}
      {/* ===================================================== */}

      <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 blur-[140px] rounded-full"></div>

      <div className="absolute top-[30%] right-0 w-96 h-96 bg-purple-500/20 blur-[140px] rounded-full"></div>

      {/* ===================================================== */}
      {/* HERO SECTION */}
      {/* ===================================================== */}

      <motion.div
        initial={{
          opacity: 0,
          y: 40,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        className="relative overflow-hidden rounded-[40px] border border-white/10 bg-[#071028]/80 backdrop-blur-2xl shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
      >

        {/* ===================================================== */}
        {/* POSTER */}
        {/* ===================================================== */}

        {event.poster && (

          <div className="relative bg-black flex items-center justify-center overflow-hidden">

            {/* BLURRED BG */}

            <img
              src={event.poster}
              alt={event.title}
              className="absolute inset-0 w-full h-full object-cover blur-3xl scale-110 opacity-25"
            />

            {/* MAIN IMAGE */}

            <img
              src={event.poster}
              alt={event.title}
              className="relative z-10 max-h-[700px] w-auto max-w-full object-contain"
            />

            {/* OVERLAY */}

            <div className="absolute inset-0 bg-gradient-to-t from-[#071028] via-transparent to-transparent"></div>

          </div>

        )}

        {/* ===================================================== */}
        {/* CONTENT */}
        {/* ===================================================== */}

        <div className="relative z-20 p-8 md:p-12">

          {/* ===================================================== */}
          {/* TOP BADGES */}
          {/* ===================================================== */}

          <div className="flex flex-wrap items-center gap-3 mb-6">

            {/* CATEGORY */}

            <div className="px-5 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-semibold flex items-center gap-2">

              <Sparkles size={16} />

              {event.category ||
                "General"}

            </div>

            {/* HOST TYPE */}

            {event.createdBy?.role ===
              "teacher" && (

              <div className="px-5 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-semibold flex items-center gap-2">

                <GraduationCap size={16} />

                Teacher Hosted

              </div>

            )}

            {event.createdBy?.role ===
              "alumni" && (

              <div className="px-5 py-2 rounded-full bg-green-500/10 border border-green-500/20 text-green-300 text-sm font-semibold flex items-center gap-2">

                <BadgeCheck size={16} />

                Alumni Hosted

              </div>

            )}

            {event.createdBy?.role ===
              "admin" && (

              <div className="px-5 py-2 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-semibold">
                Admin Hosted
              </div>

            )}

            {/* AUTO DELETE */}

            {event.autoDelete && (

              <div className="px-5 py-2 rounded-full bg-red-500/10 border border-red-500/20 text-red-300 text-sm font-semibold">

                Auto Delete Enabled

              </div>

            )}

          </div>

          {/* ===================================================== */}
          {/* TITLE */}
          {/* ===================================================== */}

          <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">

            {event.title}

          </h1>

          {/* ===================================================== */}
          {/* DESCRIPTION */}
          {/* ===================================================== */}

          <div className="mt-8 rounded-[30px] border border-white/10 bg-white/5 backdrop-blur-xl p-7 md:p-9">

            <h2 className="text-xl font-bold text-white mb-5">
              About this event
            </h2>

            <p className="text-gray-300 leading-[2] text-[15px] md:text-lg whitespace-pre-line">

              {event.description}

            </p>

          </div>

          {/* ===================================================== */}
          {/* INFO GRID */}
          {/* ===================================================== */}

          <div className="grid md:grid-cols-4 gap-5 mt-8">

            {/* LOCATION */}

            <div className="rounded-[28px] bg-gradient-to-br from-pink-500/10 to-purple-500/10 border border-white/10 p-6">

              <div className="w-14 h-14 rounded-2xl bg-pink-500/20 flex items-center justify-center mb-5">

                <MapPin
                  className="text-pink-400"
                  size={24}
                />

              </div>

              <p className="text-gray-400 text-sm mb-1">
                Location
              </p>

              <h3 className="text-white text-xl font-bold">

                {event.location}

              </h3>

            </div>

            {/* DURATION */}

            <div className="rounded-[28px] bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-white/10 p-6">

              <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-5">

                <CalendarDays
                  className="text-cyan-400"
                  size={24}
                />

              </div>

              <p className="text-gray-400 text-sm mb-1">
                Duration
              </p>

              <h3 className="text-white font-bold leading-relaxed">

                {dayjs(
                  event.startDate ||
                    event.date
                ).format(
                  "DD MMM YYYY"
                )}

                <br />

                →

                <br />

                {dayjs(
                  event.endDate ||
                    event.date
                ).format(
                  "DD MMM YYYY"
                )}

              </h3>

            </div>

            {/* STATUS */}

            <div className="rounded-[28px] bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-white/10 p-6">

              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-5">

                <Clock3
                  className="text-purple-400"
                  size={24}
                />

              </div>

              <p className="text-gray-400 text-sm mb-1">
                Status
              </p>

              <h3 className="text-white text-xl font-bold">

                {daysLeft > 0
                  ? `${daysLeft} Days Left`
                  : "Ending Today 🔥"}

              </h3>

            </div>

            {/* ATTENDEES */}

            <div className="rounded-[28px] bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-white/10 p-6">

              <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-5">

                <Users
                  className="text-green-400"
                  size={24}
                />

              </div>

              <p className="text-gray-400 text-sm mb-1">
                Attendees
              </p>

              <h3 className="text-white text-xl font-bold">

                {
                  event.attendees
                    ?.length
                }{" "}
                Joined

              </h3>

            </div>

          </div>

          {/* ===================================================== */}
          {/* ATTENDEES */}
          {/* ===================================================== */}

          {event.attendees
            ?.length > 0 && (

            <div className="mt-10">

              <h2 className="text-2xl font-black text-white mb-5">

                People Joining

              </h2>

              <div className="flex flex-wrap gap-4">

                {event.attendees.map(
                  (u) => (

                    <motion.div
                      key={u._id}
                      whileHover={{
                        y: -4,
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl"
                    >

                      <img
                        src={
                          u.profilePic ||
                          "https://via.placeholder.com/50"
                        }
                        alt={u.name}
                        className="w-12 h-12 rounded-full object-cover border border-white/20"
                      />

                      <div>

                        <p className="text-white font-semibold">

                          {u.name}

                        </p>

                      </div>

                    </motion.div>

                  )
                )}

              </div>

            </div>

          )}

        </div>

      </motion.div>

    </div>
  );
};

export default EventDetails;