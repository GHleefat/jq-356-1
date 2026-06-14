import React from 'react';
import { GameCanvas } from '../components/GameCanvas';
import { MainMenu } from '../components/MainMenu';
import { HUD } from '../components/HUD';
import { WinScreen } from '../components/WinScreen';

const GamePage: React.FC = () => {
  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <GameCanvas />
      <HUD />
      <MainMenu />
      <WinScreen />
    </div>
  );
};

export default GamePage;
