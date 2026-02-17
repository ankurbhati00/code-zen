import { motion } from "framer-motion";
import ChatBox from "./ChatBox";
import { Button } from "../ui/button";
import { useState } from "react";
import { Loader, Send } from "lucide-react";

export default function LandingPage() {
  const [loading, setLoading] = useState<boolean>(false);
  return (
    <motion.div
      className="flex-1 flex flex-col items-center justify-center p-4 h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className=" w-full h-full mx-auto text-center "
        initial={{ y: 20 }}
        animate={{ y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <p className="text-lg md:text-xl text-muted-foreground mb-8">
          Transform your idea into a website with a simple prompt.
        </p>
        <ChatBox
          setLoading={setLoading}
          className=" w-full h-full px-[20%] "
          footer={
            <div className="flex flex-col items-start">
              <Button type="submit" className="w-full ">
                {loading ? (
                  <>
                    Generating... <Loader className="animate-spin" size={20} />
                  </>
                ) : (
                  <span className="flex gap-2 justify-center items-center">
                    <span>Generate</span> <Send size={16} />
                  </span>
                )}
              </Button>
            </div>
          }
          label={<></>}
        />
      </motion.div>
    </motion.div>
  );
}
