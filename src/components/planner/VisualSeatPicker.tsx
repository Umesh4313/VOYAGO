import React from 'react';
import { TravelOption } from '../../types';
import { Plane, Train, Bus, Check, AlertCircle } from 'lucide-react';

interface VisualSeatPickerProps {
  transport: TravelOption;
  travelersCount: number;
  selectedSeats: string[];
  onSeatsChange: (seats: string[]) => void;
  seatClass?: 'AC' | 'NON_AC';
}

export const VisualSeatPicker: React.FC<VisualSeatPickerProps> = ({
  transport,
  travelersCount,
  selectedSeats,
  onSeatsChange,
  seatClass = 'AC',
}) => {
  const rows = transport.mode === 'TRAIN'
    ? Array.from({ length: 12 }, (_, index) => index + 1)
    : transport.mode === 'BUS'
    ? Array.from({ length: 10 }, (_, index) => index + 1)
    : [1, 2, 3, 4, 5, 6, 7, 8];
  const leftCols = ['A', 'B'];
  const rightCols = ['C', 'D'];

  // Default occupied seats based on transport id so it's consistent
  const defaultOccupied = [
    ...(transport.mode === 'TRAIN'
      ? ['1B', '2C', '3A', '4D', '6B', '7C', '9A', '10D']
      : transport.mode === 'BUS'
      ? ['1A', '2D', '4B', '6C', '8A']
      : ['1B', '2D', '3A', '4B', '4C', '6A', '7C', '8B']),
    ...(transport.occupiedSeats || []),
  ];

  const handleSeatClick = (seatCode: string) => {
    if (defaultOccupied.includes(seatCode)) {
      return; // Prevent occupied selection
    }

    if (selectedSeats.includes(seatCode)) {
      // Unselect
      onSeatsChange(selectedSeats.filter((s) => s !== seatCode));
    } else {
      // If already reached limit, replace the oldest or don't allow
      if (selectedSeats.length < travelersCount) {
        onSeatsChange([...selectedSeats, seatCode]);
      } else {
        // Shift oldest out and add new seat
        const newSeats = [...selectedSeats.slice(1), seatCode];
        onSeatsChange(newSeats);
      }
    }
  };

  const handleAutoSelect = () => {
    const availableSeats: string[] = [];
    for (const r of rows) {
      for (const col of [...leftCols, ...rightCols]) {
        const code = `${r}${col}`;
        if (!defaultOccupied.includes(code)) {
          availableSeats.push(code);
          if (availableSeats.length === travelersCount) break;
        }
      }
      if (availableSeats.length === travelersCount) break;
    }
    onSeatsChange(availableSeats);
  };

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-xs space-y-6 mt-4 animate-in fade-in">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] flex items-center justify-center">
            {transport.mode === 'FLIGHT' && <Plane className="w-5 h-5" />}
            {transport.mode === 'TRAIN' && <Train className="w-5 h-5" />}
            {transport.mode === 'BUS' && <Bus className="w-5 h-5" />}
          </div>
          <div>
            <h4 className="font-serif-display text-lg font-light text-stone-900 flex items-center gap-2">
              <span>
                {transport.mode === 'TRAIN'
                  ? 'IRCTC-style Coach Seat Selection'
                  : transport.mode === 'BUS'
                  ? 'Bus Seat Selection'
                  : 'Interactive Seat Selection'}
              </span>
              <span className="text-xs px-2 py-0.5 rounded bg-[#9D3373]/10 border border-[#9D3373]/20 font-mono text-[#9D3373]">
                {transport.code} • {seatClass === 'AC' ? 'AC' : 'Non-AC'}
              </span>
            </h4>
            <p className="text-xs text-stone-500">
              {transport.operator} • {transport.fromCity} → {transport.toCity}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-stone-500 block">Required Seats</span>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                selectedSeats.length === travelersCount
                  ? 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'
                  : 'bg-amber-500/10 text-amber-700 border-amber-500/30'
              }`}
            >
              {selectedSeats.length} of {travelersCount} selected
            </span>
          </div>

          <button
            type="button"
            onClick={handleAutoSelect}
            className="px-3 py-1.5 rounded-lg border border-stone-200 text-[11px] font-semibold text-stone-700 hover:border-[#9D3373] hover:text-[#9D3373] hover:bg-stone-50 transition-colors"
          >
            Auto-Assign
          </button>
        </div>
      </div>

      {/* Seat Legend */}
      <div className="flex items-center justify-center gap-6 text-xs text-stone-600 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md border border-stone-200 bg-white" />
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#9D3373] text-white flex items-center justify-center font-bold text-[10px]">
            <Check className="w-3 h-3" />
          </div>
          <span className="text-stone-900 font-medium">Selected ({selectedSeats.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-500 text-[10px] font-bold">
            ✕
          </div>
          <span>Occupied / Reserved</span>
        </div>
      </div>

      {/* Visual Cabin Layout */}
      <div className="max-w-md mx-auto bg-[#FAF8F5] border border-stone-200 rounded-3xl p-6 shadow-inner relative overflow-hidden">
        {/* Cockpit / Driver Front Indicator */}
        <div className="flex items-center justify-center mb-6">
          <div className="px-6 py-1.5 rounded-t-2xl border-t border-x border-stone-200 bg-white text-[10px] uppercase font-bold tracking-widest text-stone-500">
            {transport.mode === 'FLIGHT'
              ? '✈ Cockpit & First Row'
              : transport.mode === 'BUS'
              ? '🚌 Driver Cabin'
              : '🚆 Coach 1 • Locomotive Direction'}
          </div>
        </div>

        {/* Column Labels */}
        <div className="grid grid-cols-5 gap-2 text-center text-xs font-mono font-bold text-stone-500 mb-3">
          <div>{transport.mode === 'TRAIN' ? 'LB / Window' : 'A (Window)'}</div>
          <div>{transport.mode === 'TRAIN' ? 'MB' : 'B'}</div>
          <div className="text-[10px] text-stone-400 uppercase">
            {transport.mode === 'TRAIN' ? 'Aisle' : 'Aisle'}
          </div>
          <div>{transport.mode === 'TRAIN' ? 'UB' : 'C'}</div>
          <div>{transport.mode === 'TRAIN' ? 'SU' : 'D (Window)'}</div>
        </div>

        {/* Rows */}
        <div className="space-y-2.5">
          {rows.map((r) => (
            <div key={r} className="grid grid-cols-5 gap-2 items-center">
              {/* Left Column A */}
              {(() => {
                const codeA = `${r}A`;
                const isOccupiedA = defaultOccupied.includes(codeA);
                const isSelectedA = selectedSeats.includes(codeA);

                return (
                  <button
                    key={codeA}
                    type="button"
                    disabled={isOccupiedA}
                    onClick={() => handleSeatClick(codeA)}
                    title={isOccupiedA ? `Seat ${codeA} is occupied` : `Select Seat ${codeA}`}
                    className={`h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                      isSelectedA
                        ? 'bg-[#9D3373] text-white shadow-xs ring-2 ring-[#9D3373]'
                        : isOccupiedA
                        ? 'bg-rose-50 border border-rose-200 text-rose-300 cursor-not-allowed'
                        : 'bg-white border border-stone-200 text-stone-700 hover:border-[#9D3373] hover:text-[#9D3373]'
                    }`}
                  >
                    <span>{codeA}</span>
                    {isSelectedA && <span className="text-[9px] font-extrabold">✓</span>}
                  </button>
                );
              })()}

              {/* Left Column B */}
              {(() => {
                const codeB = `${r}B`;
                const isOccupiedB = defaultOccupied.includes(codeB);
                const isSelectedB = selectedSeats.includes(codeB);

                return (
                  <button
                    key={codeB}
                    type="button"
                    disabled={isOccupiedB}
                    onClick={() => handleSeatClick(codeB)}
                    title={isOccupiedB ? `Seat ${codeB} is occupied` : `Select Seat ${codeB}`}
                    className={`h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                      isSelectedB
                        ? 'bg-[#9D3373] text-white shadow-xs ring-2 ring-[#9D3373]'
                        : isOccupiedB
                        ? 'bg-rose-50 border border-rose-200 text-rose-300 cursor-not-allowed'
                        : 'bg-white border border-stone-200 text-stone-700 hover:border-[#9D3373] hover:text-[#9D3373]'
                    }`}
                  >
                    <span>{codeB}</span>
                    {isSelectedB && <span className="text-[9px] font-extrabold">✓</span>}
                  </button>
                );
              })()}

              {/* Center Aisle Indicator */}
              <div className="text-center font-mono text-[11px] text-stone-400 select-none">
                {r}
              </div>

              {/* Right Column C */}
              {(() => {
                const codeC = `${r}C`;
                const isOccupiedC = defaultOccupied.includes(codeC);
                const isSelectedC = selectedSeats.includes(codeC);

                return (
                  <button
                    key={codeC}
                    type="button"
                    disabled={isOccupiedC}
                    onClick={() => handleSeatClick(codeC)}
                    title={isOccupiedC ? `Seat ${codeC} is occupied` : `Select Seat ${codeC}`}
                    className={`h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                      isSelectedC
                        ? 'bg-[#9D3373] text-white shadow-xs ring-2 ring-[#9D3373]'
                        : isOccupiedC
                        ? 'bg-rose-50 border border-rose-200 text-rose-300 cursor-not-allowed'
                        : 'bg-white border border-stone-200 text-stone-700 hover:border-[#9D3373] hover:text-[#9D3373]'
                    }`}
                  >
                    <span>{codeC}</span>
                    {isSelectedC && <span className="text-[9px] font-extrabold">✓</span>}
                  </button>
                );
              })()}

              {/* Right Column D */}
              {(() => {
                const codeD = `${r}D`;
                const isOccupiedD = defaultOccupied.includes(codeD);
                const isSelectedD = selectedSeats.includes(codeD);

                return (
                  <button
                    key={codeD}
                    type="button"
                    disabled={isOccupiedD}
                    onClick={() => handleSeatClick(codeD)}
                    title={isOccupiedD ? `Seat ${codeD} is occupied` : `Select Seat ${codeD}`}
                    className={`h-11 rounded-xl text-xs font-bold transition-all flex flex-col items-center justify-center ${
                      isSelectedD
                        ? 'bg-[#9D3373] text-white shadow-xs ring-2 ring-[#9D3373]'
                        : isOccupiedD
                        ? 'bg-rose-50 border border-rose-200 text-rose-300 cursor-not-allowed'
                        : 'bg-white border border-stone-200 text-stone-700 hover:border-[#9D3373] hover:text-[#9D3373]'
                    }`}
                  >
                    <span>{codeD}</span>
                    {isSelectedD && <span className="text-[9px] font-extrabold">✓</span>}
                  </button>
                );
              })()}
            </div>
          ))}
        </div>

        {/* Rear Galley / Restrooms */}
        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-[10px] text-stone-500 font-mono">
          <span>🚪 Exit Door</span>
          <span>🚻 Lavatory / Galley</span>
          <span>🚪 Exit Door</span>
        </div>
      </div>

      {/* Selected Seats Summary Banner */}
      <div className="bg-[#FAF8F5] border border-stone-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-stone-500 block mb-0.5">
            Confirmed Passenger Seats
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {selectedSeats.length > 0 ? (
              selectedSeats.map((s) => (
                <span
                  key={s}
                  className="px-2.5 py-0.5 rounded-md bg-[#9D3373]/10 border border-[#9D3373]/20 text-[#9D3373] text-xs font-mono font-bold"
                >
                  Seat {s}
                </span>
              ))
            ) : (
              <span className="text-xs text-amber-600 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                Please select {travelersCount} seat{travelersCount > 1 ? 's' : ''} to proceed
              </span>
            )}
          </div>
        </div>

        <div className="sm:text-right">
          <span className="text-[10px] text-stone-500 block">Seat Reservation Fee</span>
          <span className="text-xs font-bold text-emerald-700">₹0 (Standard Included)</span>
        </div>
      </div>
    </div>
  );
};
