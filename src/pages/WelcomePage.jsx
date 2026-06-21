import Mascot from '../components/ui/Mascot'

export default function WelcomePage({ onContinue }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6 text-center relative z-10">
      <h1 className="text-[30px] font-extrabold text-text-primary tracking-tight leading-[1.18] mb-3">
        Vamos organizar<br />sua bagunça
      </h1>

      <p className="text-[13px] text-text-secondary font-medium leading-relaxed mb-[54px] px-1">
        Joga tudo que tá na sua cabeça.<br />Eu cuido do resto.
      </p>

      <div className="relative w-full" style={{ height: 108 }}>
        <Mascot
          pose="login"
          width={192}
          className="absolute z-[1]"
          style={{
            right: 2,
            bottom: 9,
            filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.4))',
          }}
        />
        <button
          onClick={onContinue}
          className="relative z-[2] w-full py-[18px] px-[22px] rounded-[25px]
                     text-white text-[15.5px] font-extrabold
                     flex items-center justify-center gap-1.5"
          style={{
            background: 'linear-gradient(145deg, #1B9DC6, #0E7C9E)',
            boxShadow: '0 10px 26px rgba(27,157,198,0.4)',
          }}
        >
          Por aqui <span style={{ fontSize: 17 }}>→</span>
        </button>
      </div>
    </div>
  )
}
