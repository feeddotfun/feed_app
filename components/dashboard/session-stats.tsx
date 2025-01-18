import { Card, CardContent } from "@/components/ui/card";
import { Clock, Users, Timer, Vote, ThumbsUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn, convertLamportsToSol, formatPhaseString, formatTime } from "@/lib/utils";
import SolIcon from "../ui/solana-icon";

interface SessionStatsProps {
  status: string;
  remainingTime: number | null;
  contributeEndTime: number | null;
  nextSessionTime: number | null;
  memeSlots: {
    current: number;
    max: number;
  };
  contributorCount?: number;
  totalContributions?: number;
  totalVotes?: number;
}

export const SessionStats = ({
  status,
  remainingTime,
  contributeEndTime,
  nextSessionTime,
  memeSlots,
  contributorCount = 0,
  totalContributions = 0,
  totalVotes = 0,
}: SessionStatsProps) => {
  // Determine which stats to show based on status
  const isVotingPhase = ['Voting', 'LastVoting'].includes(status);
  const isContributingPhase = status === 'Contributing';

  const getTimeDisplay = () => {
    if (status === 'LastVoting' && remainingTime !== null) {
      return {
        label: "Time Remaining",
        value: formatTime(remainingTime)
      };
    }
    if (status === 'Contributing' && contributeEndTime !== null) {
      return {
        label: "Contributing ends in",
        value: formatTime(contributeEndTime)
      };
    }
    if (status === 'Completed' && nextSessionTime !== null) {
      return {
        label: "Next session in",
        value: formatTime(nextSessionTime)
      };
    }
    return {
      label: "Time",
      value: '--:--'
    };
  };

  const timeInfo = getTimeDisplay();

  const items = [
    {
      label: "Status",
      value: formatPhaseString(status),
      icon: Timer,
      render: (value: string) => (
        <Badge variant="outline" className="font-semibold text-sm sm:text-base">
          {value}
        </Badge>
      )
    },
    ...(isVotingPhase ? [
      {
        label: "Meme Slots",
        value: `${memeSlots.current}/${memeSlots.max}`,
        icon: Vote,
      }
    ] : []),
    {
      label: timeInfo.label,
      value: timeInfo.value,
      icon: Clock,
    },
    ...(isVotingPhase ? [
      {
        label: "Total Votes",
        value: totalVotes.toLocaleString(),
        icon: ThumbsUp,
      }
    ] : isContributingPhase ? [
      {
        label: "Contributors",
        value: contributorCount.toLocaleString(),
        icon: Users,
      },
      {
        label: "Total Contributions",
        value: `${convertLamportsToSol(totalContributions)} SOL`,
        icon: () => <SolIcon className="w-4 h-3"/>,
      }
    ] : [])
  ];

  return (
    <Card className="bg-[#141716]/50 backdrop-blur-sm mt-6">
      <CardContent className="p-4">
        <div 
          className={cn(
            "grid gap-4",
            items.length <= 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2 sm:grid-cols-4"
          )}
        >
          {items.map((item, index) => (
            <div key={index} className="space-y-1.5">
              <div className="text-sm sm:text-base text-muted-foreground">{item.label}</div>
              <div className="flex items-center gap-2 font-semibold text-base sm:text-lg">
                <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                {item.render ? item.render(item.value) : item.value}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};