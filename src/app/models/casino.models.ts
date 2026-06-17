export interface Usuario {
  id: number;
  username: string;
  email: string;
  saldo: number;
  rol: 'jugador' | 'admin';
  creado_en?: string;
}

export interface RespuestaAuth {
  usuario: Usuario;
  token: string;
}

export interface Juego {
  id: number;
  codigo: 'slots' | 'roulette' | 'blackjack';
  nombre: string;
  descripcion: string;
  apuesta_min: number;
  apuesta_max: number;
}

export interface Transaccion {
  id: number;
  tipo: 'apuesta' | 'premio' | 'deposito' | 'retiro' | 'ajuste';
  monto: number;
  saldo_post: number;
  juego?: string | null;
  detalle?: any;
  creada_en: string;
}

// ----- Slots -----
export interface ResultadoSlots {
  rodillos: string[];
  apuesta: number;
  premio: number;
  multiplicador: number;
  tipo: 'tres-iguales' | 'dos-iguales' | 'perdida';
  neto: number;
}

// ----- Ruleta -----
export type ColorRuleta = 'rojo' | 'negro' | 'verde';
export interface ApuestaRuleta {
  tipo: 'numero' | 'color' | 'paridad' | 'docena';
  valor: string | number;
  monto: number;
  gana?: boolean;
  retorno?: number;
}
export interface ResultadoRuleta {
  numero: number;
  color: ColorRuleta;
  apuestas: ApuestaRuleta[];
  totalApostado: number;
  totalRetornado: number;
  neto: number;
}

// ----- Blackjack -----
export interface Carta { valor: string; palo: string; oculta?: boolean; }
export interface EstadoBlackjack {
  sesionId: number;
  jugador: Carta[];
  banca: Carta[];
  apuesta: number;
  terminada: boolean;
  resultado: 'gana' | 'pierde' | 'empate' | 'blackjack' | null;
  retorno: number;
  totales: { jugador: number; banca: number } | null;
  saldo: number;
}

// ----- Microservicios -----
export interface Bono {
  id: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  tipo: 'monto_fijo' | 'porcentaje';
  valor: number;
  un_solo_uso: boolean;
}

export interface BonoReclamado {
  id: number;
  codigo: string;
  nombre: string;
  monto_otorgado: number;
  reclamado_en: string;
}

export interface RespuestaReclamarBono {
  bono: string;
  monto_otorgado: number;
  saldo: number;
}

export interface EventoDeportivo {
  id: number;
  deporte: string;
  liga: string;
  equipo_local: string;
  equipo_visita: string;
  badge_local?: string;
  badge_visita?: string;
  inicio?: string;
  cuota_local: number;
  cuota_empate: number;
  cuota_visita: number;
  estado: string;
}

export type SeleccionApuestaDeportiva = 'local' | 'empate' | 'visita';

export interface ApuestaDeportiva {
  id: number;
  seleccion: SeleccionApuestaDeportiva;
  monto: number;
  cuota: number;
  ganancia_potencial: number;
  estado: 'pendiente' | 'ganada' | 'perdida';
  creada_en: string;
  resuelta_en?: string | null;
  deporte: string;
  liga: string;
  equipo_local: string;
  equipo_visita: string;
  resultado?: string | null;
  goles_local?: number | null;
  goles_visita?: number | null;
}

export interface RespuestaApuestaDeportiva {
  apuesta_id: number;
  evento_id: number;
  seleccion: SeleccionApuestaDeportiva;
  monto: number;
  cuota: number;
  ganancia_potencial: number;
  estado: string;
  saldo: number;
}

export interface EstadisticasMias {
  resumen: {
    total_apostado: number;
    total_premios: number;
    total_depositos: number;
    neto: number;
    n_apuestas: number;
    saldo_actual: number;
  };
  por_tipo: Array<{
    tipo: string;
    total: number;
    count: number;
  }>;
  linea_saldo: Array<{
    fecha: string;
    saldo_post: number;
  }>;
}