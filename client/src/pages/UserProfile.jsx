import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { getUserById } from "../services/userId.service";
import { motion } from "framer-motion";
import {
  Sparkles,
  User,
} from "lucide-react";

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  function formatDate(iso) {
    if (!iso) return "—";
    try {
      return new Date(iso).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;
        const res = await getUserById(id);
        if (res) {
          setUser(res);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchUser();
  }, [id]);

  if (!user)
    return (
      <p className="relative rounded-2xl h-screen flex items-center justify-center bg-red-500/30 backdrop-blur-sm p-10 text-center text-white/70 text-9xl font-extrabold tracking-tighter">
        Loading user...
      </p>
    );

  return (
    <div className="min-h-screen bg-linear-to-r from-orange-200/50 via-orange-100/20 to-orange-400/30 pt-20 md:pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-8"
        >
          <p className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-orange-600/90 font-medium">
            <Sparkles size={14} />
            {user.name}'s space
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-extrabold bg-linear-to-r from-amber-900 to-amber-700 bg-clip-text text-transparent mt-1">
            {user.name}'s Profile
          </h1>
          <p className="text-gray-600 font-sans mt-2 max-w-xl">
            Manage your Dhoomchhalle account and jump back into planning your
            journey.
          </p>
        </motion.div>
        <div className="flex flex-col justify-start items-start gap-8 flex-wrap md:flex-nowrap">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05, duration: 0.8 }}
            className="md:w-auto w-full flex flex-row justify-start items-center gap-8 flex-wrap md:flex-nowrap shadow-md rounded-2xl overflow-hidden p-5"
          >
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              <img
                src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                height={80}
                width={80}
                alt="user-profile-image"
                className="rounded-full border-2 border-black/50 shadow-[6px_6px_6px_gray]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.8 }}
            >
              <p>
                <strong className="text-3xl text-red-800 font-bold">
                  {user.name}
                </strong>
              </p>

              <hr className="mt-2 text-red-900 w-auto font-extrabold border-[1.5px]" />

              <div className="flex flex-row gap-6 mt-3">
                <div>
                  <p className="font-semibold text-center text-gray-600 text-xl">
                    12
                  </p>
                  <p className="text-gray-600 font-semibold">Feedbacks</p>
                </div>

                <div>
                  <p className="font-semibold text-center text-gray-600 text-xl">
                    45
                  </p>
                  <p className="text-gray-600 font-semibold">Traveled places</p>
                </div>

                <div>
                  <p className="font-semibold text-center text-gray-600 text-xl">
                    16
                  </p>
                  <p className="text-gray-600 font-semibold">Days stayed</p>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Bio */}
          <div className="flex flex-row justify-start items-center gap-8 flex-wrap md:flex-nowrap">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="w-full rounded-2xl shadow-md overflow-hidden p-5"
            >
              <div className="w-1/9 border-b-2 border-b-red-400">
                <h1 className="text-xl font-bold tracking-widest text-red-800">Bio Section</h1>
              </div>
              <p className="text-gray-600 font-semibold mt-4">
                If you change the way you look at things, the things you look
                will be changed 😍e^πi + 1 = 0: beauty of mathematics 🇮🇳Army
                Bratt 💻AI/ML+Cyber Sec
              </p>
            </motion.div>
          </div>

          {/* Edit profile */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            className="flex flex-row items-center gap-4 mx-auto w-full justify-evenly"
          >
            <button className="text-xl w-[45%] py-4 bg-gray-300/40 text-black/80 hover:bg-black/80 hover:text-white/80 transition-all duration-500 rounded-xl font-bold">
              Edit Profile
            </button>
            <Link
              to={"/"}
              className="text-xl w-[45%] py-4 bg-gray-300/40 text-black/80 hover:bg-black/80 hover:text-white/80 transition-all duration-500 flex flex-row justify-center items-center rounded-xl font-bold"
            >
              <button>Home</button>
            </Link>
          </motion.div>

          {/* Feedback notices */}
          <div className="p-3 pt-5 shadow-md rounded-2xl">
            <div className="group relative w-[15%] cursor-pointer">
              <h1 className="text-xl font-bold text-red-900 font-sans">
                My Feedbacks
              </h1>
              <div className="absolute w-0 group-hover:w-full border border-b-2 border-b-red-400 transition-all duration-300"></div>
            </div>
            <div className="flex flex-col justify-start items-center gap-8 flex-wrap md:flex-nowrap">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="w-full rounded-2xl shadow-md overflow-hidden p-5"
              >
                <p className="text-gray-600 font-semibold">
                  GeeksForGeeks technically contains websites that might
                  potentially have a lot of information. It has everything you
                  need to succeed in an interview, and if you can read at least
                  10 pages a day and completely complete them, you can finish
                  every puzzle, practice every idea, and read every article on
                  the website that discusses interviews and other topics.
                  Although they do offer blogs covering many algorithms you are
                  likely to face in CP, Geeksforgeeks is not for competitive
                  programming
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 1 }}
                className="w-full rounded-2xl shadow-md overflow-hidden p-5"
              >
                <p className="text-gray-600 font-semibold">
                  Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                  Repellendus iusto molestias quod dicta itaque consectetur
                  optio ipsa nisi vel rerum quisquam tempore obcaecati possimus
                  numquam error in atque, eum odio blanditiis magni fugit
                  incidunt non. Atque ea quisquam quae asperiores quo officiis
                  aperiam ut impedit dolorem, veritatis magni natus cumque.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.9, duration: 1 }}
                className="w-full rounded-2xl shadow-md overflow-hidden p-5"
              >
                <p className="text-gray-600 font-semibold">
                  ndis quae ut quas recusandae eveniet earum excepturi
                  voluptatum nemo aliquam perspiciatis, distinctio eum itaque
                  accusamus veritatis nobis. Magnam optio quas earum neque, odio
                  blanditiis beatae eveniet nisi, porro omnis ea possimus autem
                  error odit veritatis voluptas.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: 1 }}
                className="w-full rounded-2xl shadow-md overflow-hidden p-5"
              >
                <p className="text-gray-600 font-semibold">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Libero, cupiditate sit. Quam asperiores, vel hic voluptas,
                  odit placeat, pariatur non voluptatem reprehenderit earum
                  dolorem voluptates illo neque dolorum praesentium in eaque!
                  Sint, voluptatum sed quibusdam at debitis enim saepe eaque.
                  Sequi nobis commodi ut voluptates! Veritatis nam ex doloremque
                  ipsum iste reprehenderit excepturi! Ut dolor id molestiae.
                  Quos perferendis natus, aliquid reiciendis dolorum veritatis
                  voluptatibus voluptates ab perspiciatis vel nam at obcaecati
                  doloremque architecto, laudantium animi repudiandae dolore a
                  doloribus totam soluta, aperiam aut. Cumque temporibus
                  quisquam maxime molestias saepe.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.3, duration: 1 }}
                className="w-full rounded-2xl shadow-md overflow-hidden p-5"
              >
                <p className="text-gray-600 font-semibold">
                  Lorem ipsum dolor sit amet consectetur, adipisicing elit.
                  Assumenda doloremque, porro dolorem neque mollitia nesciunt
                  praesentium libero beatae corrupti veniam, eveniet eum quam
                  quo unde molestias a. Neque, repellat laudantium. Doloribus
                  perspiciatis ea exercitationem iure error temporibus eius
                  dolorem voluptas nihil corrupti, voluptatum minima ex ipsum
                  dolorum voluptates aperiam animi, eligendi ad quas adipisci
                  similique asperiores? Dolor beatae officia vitae! Hic nihil
                  maiores a dolor qui atque officiis natus assumenda temporibus.
                  Labore, nam. Delectus quis cumque animi esse. Fuga architecto
                  temporibus eos quae officiis error, provident corporis et.
                  Commodi, deserunt. Autem corrupti ad pariatur repudiandae iure
                  quibusdam aliquam, suscipit dolorem sapiente eum
                  exercitationem inventore, molestiae similique accusantium
                  aperiam culpa, cumque quod tempore assumenda praesentium minus
                  deserunt voluptas debitis? Temporibus, quo? Repudiandae,
                  quaerat nihil sequi officia fugiat nisi ad quidem. Voluptatem
                  temporibus facere corporis earum amet rerum, expedita eveniet
                  quisquam quaerat impedit veritatis debitis. Illo sit, ipsum
                  provident iure sapiente neque? Minus repudiandae,
                  reprehenderit nulla consequuntur at totam quos cum dolorum
                  labore qui saepe, odit quis adipisci ex, eaque fugit repellat
                  ipsa autem voluptate veritatis tempora nobis inventore? Earum,
                  illo adipisci. A, accusamus! Odio sunt assumenda, nisi
                  obcaecati doloremque consequuntur iste? Consequatur odio
                  cupiditate, enim minima corporis dolores voluptates aspernatur
                  libero ad expedita doloribus, labore nam earum eveniet vero
                  voluptas in.
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
