import { GameControlWidget } from '../widgets/GameControlWidget';
import { BoardWidget } from '../widgets/BoardWidget';
import { HistoryWidget } from '../widgets/HistoryWidget';

export const GomokuPage = () => {
  return (
    <div className="grid h-screen grid-cols-12 gap-4 p-4 bg-background">
      <aside className="col-span-3">
        <GameControlWidget />
      </aside>
      <main className="col-span-6 flex items-center justify-center bg-slate-50 rounded-lg shadow-inner">
        <BoardWidget />
      </main>
      <aside className="col-span-3">
        <HistoryWidget />
      </aside>
    </div>
  );
};
