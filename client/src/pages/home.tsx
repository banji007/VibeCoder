import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChartBar, Heart } from "lucide-react";
import {
  FaTwitter as SiTwitter,
  FaLinkedin as SiLinkedin,
  FaInstagram as SiInstagram,
  FaYoutube as SiYoutube,
} from "react-icons/fa";

const FloatingHeart = () => (
  <motion.div
    initial={{ y: 0, opacity: 1, scale: 1 }}
    animate={{ y: -100, opacity: 0, scale: 2 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 1.5, ease: "easeOut" }}
    className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 pointer-events-none"
  >
    <Heart className="w-12 h-12 text-primary" fill="currentColor" />
  </motion.div>
);

interface StatsData {
  total: number;
  average: number;
}

const DonutChart = ({ value }: { value: number }) => {
  const percentage = (value / 10) * 100;
  const circumference = 2 * Math.PI * 40; // r = 40
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-16 h-16">
      <svg className="w-16 h-16 transform -rotate-90">
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-primary/20"
        />
        <circle
          cx="32"
          cy="32"
          r="28"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="text-primary transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-sm font-bold">
        {value}
      </div>
    </div>
  );
};

export default function Home() {
  const [value, setValue] = useState([5]);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showHeart, setShowHeart] = useState(false);

  const { data: stats = { total: 0, average: 0 }, isLoading } = useQuery<StatsData>({
    queryKey: ["/api/ratings/stats"],
  });

  const { data: userStatus } = useQuery<{ hasRated: boolean }>({
    queryKey: ["/api/ratings/user-status"],
  });

  const { mutate: submitRating, isPending } = useMutation({
    mutationFn: async (rating: number) => {
      const res = await apiRequest("POST", "/api/ratings", { rating });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratings/stats"] });
      queryClient.invalidateQueries({ queryKey: ["/api/ratings/user-status"] });
      toast({
        title: "Rating submitted!",
        description: "Thanks for sharing your vibe coding level!",
      });
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1500);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center flex items-center justify-center gap-2">
              <Heart className="w-8 h-8 text-primary animate-pulse" />
              Vibe Coding Meter
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <ChartBar className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <div className="text-2xl font-bold">
                    {isLoading ? "-" : stats.total}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Total Ratings
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-primary/5 border-primary/20">
                <CardContent className="pt-6 text-center">
                  <div className="flex justify-center mb-2">
                    <DonutChart value={stats.average} />
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Average Rating
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {userStatus?.hasRated ? (
                <div className="text-center text-muted-foreground">
                  Thank you for rating! You've already submitted your vibe coding level.
                </div>
              ) : (
                <>
                  <h2 className="text-xl font-semibold text-center">
                    How much vibe coding do you do?
                  </h2>
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    className="p-6 rounded-lg bg-primary/5 border border-primary/20"
                  >
                    <Slider
                      value={value}
                      onValueChange={setValue}
                      max={10}
                      min={1}
                      step={1}
                      className="[&_[role=slider]]:h-6 [&_[role=slider]]:w-6 [&_[role=slider]]:border-primary"
                    />
                    <div className="mt-2 text-center text-2xl font-bold text-primary">
                      {value[0]}/10
                    </div>
                  </motion.div>
                  <Button
                    onClick={() => submitRating(value[0])}
                    disabled={isPending}
                    className="w-full"
                    size="lg"
                  >
                    {isPending ? "Submitting..." : "Submit Rating"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="w-full py-6 px-4 border-t border-border">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-sm text-muted-foreground mb-4">
            This app is completely made using vibe coding
          </p>
          <p className="text-sm font-medium mb-4">Follow me</p>
          <div className="flex justify-center gap-6">
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://twitter.com/banji_007"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiTwitter className="w-6 h-6" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://linkedin.com/in/anirban-banerjee-007"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiLinkedin className="w-6 h-6" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://instagram.com/banji_007"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiInstagram className="w-6 h-6" />
            </motion.a>
            <motion.a
              whileHover={{ scale: 1.2 }}
              href="https://youtube.com/@banji007"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              <SiYoutube className="w-6 h-6" />
            </motion.a>
          </div>
        </div>
      </footer>

      <AnimatePresence>{showHeart && <FloatingHeart />}</AnimatePresence>
    </div>
  );
}