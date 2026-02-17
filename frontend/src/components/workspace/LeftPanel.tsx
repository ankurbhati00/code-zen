import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { CheckCircle, Loader, Send, Sparkles } from "lucide-react";
import React, { useState } from "react";
import { useWorkspace } from "../../contexts/WorkspaceContext";
import ChatBox from "../landing/ChatBox";

const LeftPanel: React.FC = () => {
  const { state } = useWorkspace();
  const { steps } = state;
  const [loading, setLoading] = useState(false);

  const completedSteps = steps.filter(
    (step) => step.status === "completed"
  ).length;
  const completionPercentage =
    steps.length > 0 ? Math.round((completedSteps / steps.length) * 100) : 0;

  return (
    <motion.div
      className="h-full overflow-y-auto bg-muted/50 border-r border-border p-4 flex flex-col overflow-x-hidden"
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-foreground">Website Steps</h2>
        <div className="flex items-center text-sm text-muted-foreground">
          <CheckCircle className="w-4 h-4 mr-1 text-primary" />
          {completionPercentage}% Complete
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <h3 className="text-sm font-medium text-foreground mb-3">
          Steps to complete
        </h3>

        <div className="space-y-3">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
            >
              <Card
                className={`p-3 transition-colors ${
                  step.status === "completed"
                    ? "bg-muted border-primary/20"
                    : "bg-card"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 mr-1 text-primary" />

                    <h4
                      className={`text-sm font-medium ${
                        step.status === "completed"
                          ? "text-muted-foreground"
                          : "text-card-foreground"
                      }`}
                    >
                      {step.title}
                    </h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-border space-y-4">
        <div className="bg-card rounded-lg shadow-sm border border-border p-4">
          <h4 className="text-sm font-medium text-card-foreground mb-2 flex items-center">
            <Sparkles className="h-4 w-4 mr-2 text-primary" />
            Need help or have questions?
          </h4>
          <ChatBox
            setLoading={setLoading}
            footer={
              <Button
                type="submit"
                className="w-full flex gap-2 justify-center items-center"
              >
                {loading ? (
                  <>
                    <span>Generating...</span>{" "}
                    <Loader className="animate-spin" size={20} />
                  </>
                ) : (
                  <>
                    <span>Start</span> <Send size={16} />
                  </>
                )}
              </Button>
            }
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LeftPanel;
