import { useEffect, useState } from "react";
import API from "../../services/api";
import { motion, AnimatePresence } from "framer-motion";
import dayjs from "dayjs";

import {
  GraduationCap,
  BadgeCheck,
  CalendarDays,
  MapPin,
  Trash2,
  Clock3,
  Tag,
  Sparkles,
  Users,
  PartyPopper,
} from "lucide-react";

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import CreateEventModal from "../../components/events/CreateEventModal";

const Events = () => {

  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const [celebratingId, setCelebratingId] = useState(null);

  const { user } = useAuth();

  const navigate = useNavigate();

  /* =====================================================
     FETCH EVENTS
  ===================================================== */
  const fetchEvents = async () => {

    try {

      const { data } = await API.get("/events");

      setEvents(data);

    } catch (error) {

      console.error(error);
    }
  };

  /* =====================================================
     JOIN EVENT
  ===================================================== */
  const handleRSVP = async (
    e,
    id,
    alreadyJoined
  ) => {

    e.stopPropagation();

    try {

      await API.put(`/events/rsvp/${id}`);

      if (!alreadyJoined) {

        setCelebratingId(id);

        setTimeout(() => {
          setCelebratingId(null);
        }, 1800);
      }

      fetchEvents();

    } catch (error) {

      console.error(error);
    }
  };

  /* =====================================================
     DELETE EVENT
  ===================================================== */
  const deleteEvent = async (
    e,
    id
  ) => {

    e.stopPropagation();

    const confirmDelete =
      window.confirm(
        "Delete this event?"
      );

    if (!confirmDelete) return;

    try {

      await API.delete(`/events/${id}`);

      fetchEvents();

    } catch (error) {

      console.error(error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  /* =====================================================
     ROLE ACCESS
  ===================================================== */
  const canCreateEvent =
    user?.role === "alumni" ||
    user?.role === "teacher" ||
    user?.role === "admin";

  return (

    <div className="relative w-full max-w-[1120px] mx-auto pb-20 px-2">

      {/* BACKGROUND EFFECTS */}

      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/20 blur-[120px] rounded-full"></div>

      <div className="absolute top-[40%] right-10 w-72 h-72 bg-purple-500/20 blur-[120px] rounded-full"></div>

      {/* ===================================================== */}
      {/* HEADER */}
      {/* ===================================================== */}

      <div className="relative flex justify-between items-center flex-wrap gap-5 mb-10">

        <div>

          <div className="flex items-center gap-3 mb-2">

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">

              <Sparkles className="text-white" />

            </div>

            <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white tracking-tight">

              Events Hub

            </h1>

          </div>

          <p className="text-gray-600 dark:text-gray-400 text-lg">
            Discover workshops, hackathons & networking events
          </p>

        </div>

        {/* CREATE BUTTON */}

        {canCreateEvent && (

          <motion.button
            whileHover={{
              scale: 1.05,
            }}
            whileTap={{
              scale: 0.96,
            }}
            onClick={() =>
              setShowModal(true)
            }
            className="relative overflow-hidden px-7 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-bold shadow-2xl shadow-cyan-500/20"
          >

            <span className="relative z-10">
              + Create Event
            </span>

            <div className="absolute inset-0 bg-white/10 opacity-0 hover:opacity-100 transition"></div>

          </motion.button>

        )}

      </div>

      {/* ===================================================== */}
      {/* EVENTS */}
      {/* ===================================================== */}

      <div className="grid gap-8">

        {events.map((e, index) => {

          const daysLeft =
            dayjs(
              e.endDate || e.date
            ).diff(
              dayjs(),
              "day"
            );

          const isAttending =
            e.attendees?.some(
              (u) =>
                u === user?._id ||
                u?._id === user?._id
            );

          const canDelete =
            user?.role === "admin" ||
            e.createdBy?._id === user?._id;

          return (

            <motion.div
              key={e._id}
              initial={{
                opacity: 0,
                y: 30,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: index * 0.07,
              }}
              whileHover={{
                y: -5,
              }}
              onClick={() =>
                navigate(
                  `/events/${e._id}`
                )
              }
              className="group overflow-hidden rounded-[34px] border border-white/10 bg-[#071028]/85 backdrop-blur-2xl shadow-2xl hover:border-cyan-400/30 transition-all duration-500 cursor-pointer"
            >

              {/* POSTER */}

              {e.poster && (

                <div className="relative aspect-[16/7] overflow-hidden">

                  <img
                    src={e.poster}
                    alt={e.title}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-700"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#071028] via-black/40 to-transparent"></div>

                  {/* BADGES */}

                  <div className="absolute top-5 left-5 flex gap-2 flex-wrap z-20">

                    {e.createdBy?.role ===
                      "teacher" && (

                      <div className="px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 backdrop-blur-xl text-blue-300 text-xs flex items-center gap-2">

                        <GraduationCap size={14} />

                        Teacher Hosted

                      </div>

                    )}

                    {e.createdBy?.role ===
                      "alumni" && (

                      <div className="px-4 py-2 rounded-full bg-green-500/20 border border-green-400/30 backdrop-blur-xl text-green-300 text-xs flex items-center gap-2">

                        <BadgeCheck size={14} />

                        Alumni Hosted

                      </div>

                    )}

                  </div>

                  {/* CATEGORY */}

                  <div className="absolute top-5 right-5 z-20">

                    <div className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-xl border border-white/10 text-white text-xs flex items-center gap-2">

                      <Tag size={14} />

                      {e.category ||
                        "General"}

                    </div>

                  </div>

                  {/* TITLE */}

                  <div className="absolute bottom-8 left-8 right-8 z-20">

                    <h2 className="text-3xl md:text-5xl font-black text-white leading-tight">

                      {e.title}

                    </h2>

                    <p className="mt-3 text-gray-200 max-w-3xl line-clamp-2 text-sm md:text-base">

                      {e.description}

                    </p>

                  </div>

                </div>

              )}

              {/* CONTENT */}

              <div className="p-7 space-y-6">

                {/* INFO */}

                <div className="grid md:grid-cols-3 gap-4">

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-pink-500/20 flex items-center justify-center">

                      <MapPin
                        className="text-pink-400"
                        size={18}
                      />

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Location
                      </p>

                      <p className="text-white font-semibold">
                        {e.location}
                      </p>

                    </div>

                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-cyan-500/20 flex items-center justify-center">

                      <CalendarDays
                        className="text-cyan-400"
                        size={18}
                      />

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Duration
                      </p>

                      <p className="text-white font-semibold text-sm">

                        {dayjs(
                          e.startDate ||
                            e.date
                        ).format(
                          "DD MMM"
                        )}{" "}
                        →{" "}
                        {dayjs(
                          e.endDate ||
                            e.date
                        ).format(
                          "DD MMM YYYY"
                        )}

                      </p>

                    </div>

                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-purple-500/20 flex items-center justify-center">

                      <Users
                        className="text-purple-400"
                        size={18}
                      />

                    </div>

                    <div>

                      <p className="text-xs text-gray-500">
                        Attendees
                      </p>

                      <p className="text-white font-semibold">

                        {
                          e.attendees
                            ?.length
                        }{" "}
                        Joined

                      </p>

                    </div>

                  </div>

                </div>

                {/* ACTIONS */}

                <div className="flex flex-wrap gap-3 pt-2">

                  {/* RSVP */}

                  <motion.button
                    whileTap={{
                      scale: 0.95,
                    }}
                    onClick={(ev) =>
                      handleRSVP(
                        ev,
                        e._id,
                        isAttending
                      )
                    }
                    className={`relative overflow-hidden flex-1 h-14 rounded-2xl font-bold shadow-xl transition-all duration-300 ${
                      isAttending
                        ? "bg-green-500 text-white"
                        : "bg-gradient-to-r from-cyan-500 to-purple-500 text-white hover:opacity-90"
                    }`}
                  >

                    <AnimatePresence>

                      {celebratingId ===
                        e._id && (

                        <motion.div
                          initial={{
                            scale: 0,
                            opacity: 0,
                          }}
                          animate={{
                            scale: 1.5,
                            opacity: 1,
                          }}
                          exit={{
                            opacity: 0,
                            scale: 2,
                          }}
                          className="absolute inset-0 flex items-center justify-center"
                        >

                          <PartyPopper
                            size={26}
                            className="text-yellow-300"
                          />

                        </motion.div>

                      )}

                    </AnimatePresence>

                    <span className="relative z-10">

                      {isAttending
                        ? "✔ Joined"
                        : "🚀 Join Event"}

                    </span>

                  </motion.button>

                  {/* DELETE */}

                  {canDelete && (

                    <button
                      onClick={(ev) =>
                        deleteEvent(
                          ev,
                          e._id
                        )
                      }
                      className="h-14 px-6 rounded-2xl bg-red-600 text-white font-semibold hover:scale-105 transition flex items-center gap-2"
                    >

                      <Trash2 size={18} />

                      Delete

                    </button>

                  )}

                </div>

              </div>

            </motion.div>

          );
        })}

      </div>

      {/* CREATE MODAL */}

      {showModal && (

        <CreateEventModal
          close={() =>
            setShowModal(false)
          }
          refresh={fetchEvents}
        />

      )}

    </div>
  );
};

export default Events;