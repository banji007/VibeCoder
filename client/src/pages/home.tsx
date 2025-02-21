import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { ChartBar, Heart, Star } from "lucide-react";

export default function Home() {
  const [value, setValue] = useState([5]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/ratings/stats"],
  });

  const { mutate: submitRating, isPending } = useMutation({
    mutationFn: async (rating: number) => {
      const res = await apiRequest("POST", "/api/ratings", { rating });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ratings/stats"] });
      toast({
        title: "Rating submitted!",
        description: "Thanks for sharing your vibe coding level!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
                <div className="text-2xl font-bold">{isLoading ? "-" : stats?.total}</div>
                <div className="text-sm text-muted-foreground">Total Ratings</div>
              </CardContent>
            </Card>
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="pt-6 text-center">
                <Star className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-2xl font-bold">{isLoading ? "-" : stats?.average}</div>
                <div className="text-sm text-muted-foreground">Average Rating</div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
