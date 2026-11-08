import { motion } from "framer-motion";

const Pending = () => {
  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-cyan-400">

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white dark:bg-gray-900 p-8 rounded-2xl shadow-xl text-center space-y-4"
      >
        <h2 className="text-2xl font-bold">
          ⏳ Approval Pending
        </h2>

        <p className="text-gray-500">
          Your account is waiting for admin approval.
        </p>

        <div className="animate-pulse text-purple-500">
          Please check back later...
        </div>
      </motion.div>

    </div>
  );
};

export default Pending;