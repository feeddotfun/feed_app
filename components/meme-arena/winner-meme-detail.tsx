import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { Clock, ThumbsUp, Users } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { MemeData, MemeArenaSessionData } from "@/types"
import { convertLamportsToSol, formatTime } from "@/lib/utils"
import { ContributorsPopup } from './contributors-popup'

interface MemeDetailsProps {
  meme: MemeData;
  remainingTime: number | null;
  session: MemeArenaSessionData;
}

export const MemeDetails: React.FC<MemeDetailsProps> = ({ meme, remainingTime, session }) => {
  const [isPopupOpen, setIsPopupOpen] = React.useState(false);
  
  const handlePopupOpen = () => {
    if (session.totalContributions > 0)
      setIsPopupOpen(true)
  }

  return (
    <>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="mb-4 sm:mb-6"
      >
        <h2 className="text-xl sm:text-2xl font-bold mb-2">{meme.name}</h2>
        <p className="text-lg sm:text-xl font-semibold text-primary">{meme.ticker}</p>
      </motion.div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5, type: "spring" }}
        className="aspect-video bg-muted rounded-lg mb-4 sm:mb-6 flex items-center justify-center mx-auto max-w-md overflow-hidden relative shadow-lg"
      >
        <Image
          src={meme.image}
          alt={meme.name}
          layout="fill"
          objectFit="cover"
          priority
        />
      </motion.div>
      <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-4 sm:mb-6">
        <Badge variant="secondary" className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg font-bold">
          <ThumbsUp className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-primary" /> {meme.totalVotes} Votes
        </Badge>
        <Badge 
          variant="secondary" 
          className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg font-bold cursor-pointer hover:bg-secondary/80"
          onClick={() => handlePopupOpen}
        >      
          <Users className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-primary" /> 
          {convertLamportsToSol(session.totalContributions) ?? 0} Contributors
        </Badge>
        {remainingTime !== null && session.status === 'Contributing' && (
          <Badge variant="secondary" className="px-3 py-1 sm:px-4 sm:py-2 text-sm sm:text-lg font-bold">
            <Clock className="mr-2 w-4 h-4 sm:w-5 sm:h-5 text-primary" /> {formatTime(remainingTime)}
          </Badge>
        )}
      </div>
      <ContributorsPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
      />
    </>
)
}