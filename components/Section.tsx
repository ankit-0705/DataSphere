import { motion, Variants } from "framer-motion";
import Image from "next/image";

const fadeInVariants: Variants = {
  initial: { opacity: 0, y: 30 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: "easeOut" },
  },
};

const Section = ({
  title,
  children,
  imgSrc,
  imgAlt,
  reverse = false,
  id,
}: {
  title: string;
  children: React.ReactNode;
  imgSrc: string;
  imgAlt: string;
  reverse?: boolean;
  id?: string;
}) => {
  return (
    <>
      {/* Global styles for floating animation and backlight */}
      <style jsx global>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-8px);
          }
        }

        .floating {
          animation: float 6s ease-in-out infinite;
        }

        .backlight-wrapper {
          position: relative;
          display: inline-block;
          border-radius: 0.5rem; /* 8px to match rounded-lg */
        }

        .backlight-wrapper::before {
          content: "";
          position: absolute;
          top: 50%;
          left: 50%;
          width: 110%;
          height: 110%;
          background: rgba(255, 255, 255, 0.07);
          filter: blur(20px);
          transform: translate(-50%, -50%);
          border-radius: 12px;
          z-index: -1;
          pointer-events: none;
        }
      `}</style>

      <motion.section
        id={id}
        initial="initial"
        whileInView="animate"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeInVariants}
        className={`max-w-7xl mx-auto py-12 md:py-16 flex flex-col md:flex-row items-center gap-10 px-4 sm:px-6 md:px-16 lg:px-24 ${
          reverse ? "md:flex-row-reverse" : ""
        }`}
      >
        {/* Text Content */}
        <div className="md:w-1/2 w-full text-white">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-6 leading-tight">
            {title}
          </h2>
          <div className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto md:mx-0">
            {children}
          </div>
        </div>

        {/* Image / Animation with floating effect */}
        <div className="md:w-1/2 w-full flex justify-center">
          <div className="floating rounded-lg shadow-lg max-w-full">
            <Image
              src={imgSrc}
              alt={imgAlt}
              className="w-full max-w-md sm:max-w-lg md:max-w-full rounded-lg object-contain"
              style={{ maxHeight: "400px" }}
              width={600}
              height={400}
              priority
            />
          </div>
        </div>
      </motion.section>
    </>
  );
};

export default Section;
