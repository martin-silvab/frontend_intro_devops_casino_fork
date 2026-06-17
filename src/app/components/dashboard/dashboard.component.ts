import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CasinoService } from '../../services/casino.service';
import {
  Bono,
  BonoReclamado,
  EventoDeportivo,
  ApuestaDeportiva,
  EstadisticasMias,
  SeleccionApuestaDeportiva
} from '../../models/casino.models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <section class="tarjeta dashboard">
      <div class="cabecera">
        <div>
          <h2 class="titulo-juego">Dashboard</h2>
          <p class="sub">
            Integración directa con bonos-service, apuestas-service y estadisticas-service.
          </p>
        </div>
        <button class="btn btn-secundario" (click)="cargarTodo()">Actualizar</button>
      </div>

      <p *ngIf="error" class="error">{{ error }}</p>
      <p *ngIf="mensaje" class="ok">{{ mensaje }}</p>

      <div class="grid">
        <article class="panel">
          <h3>Bonos disponibles</h3>
          <p class="endpoint">GET /api/bonos</p>

          <label class="campo">
            Monto base para bonos porcentuales
            <input type="number" [(ngModel)]="montoBaseBono" min="0" step="1000" />
          </label>

          <div *ngIf="bonos.length; else sinBonos">
            <div *ngFor="let b of bonos" class="item">
              <strong>{{ b.codigo }} — {{ b.nombre }}</strong>
              <span>{{ b.descripcion }}</span>
              <small>
                Tipo: {{ b.tipo }} · Valor:
                <ng-container *ngIf="b.tipo === 'porcentaje'; else montoFijo">{{ b.valor }}%</ng-container>
                <ng-template #montoFijo>$ {{ b.valor | number:'1.0-0' }}</ng-template>
              </small>

              <button class="btn btn-primario mini" (click)="reclamar(b)">
                Reclamar bono
              </button>
            </div>
          </div>

          <ng-template #sinBonos>
            <p class="vacio">No hay bonos disponibles.</p>
          </ng-template>
        </article>

        <article class="panel">
          <h3>Apuestas deportivas</h3>
          <p class="endpoint">GET /api/apuestas/eventos · POST /api/apuestas</p>

          <label class="campo">
            Monto de apuesta
            <input type="number" [(ngModel)]="montoApuesta" min="10" step="10" />
          </label>

          <div *ngIf="eventos.length; else sinEventos">
            <div *ngFor="let e of eventos" class="item">
              <strong>{{ e.equipo_local }} vs {{ e.equipo_visita }}</strong>
              <span>{{ e.liga || 'Liga no informada' }} · {{ e.deporte }}</span>
              <small>
                Local {{ e.cuota_local }} · Empate {{ e.cuota_empate }} · Visita {{ e.cuota_visita }}
              </small>

              <div class="acciones-apuesta">
                <button class="btn mini" (click)="apostar(e, 'local')">Local</button>
                <button class="btn mini" (click)="apostar(e, 'empate')">Empate</button>
                <button class="btn mini" (click)="apostar(e, 'visita')">Visita</button>
              </div>
            </div>
          </div>

          <ng-template #sinEventos>
            <p class="vacio">No hay eventos abiertos.</p>
          </ng-template>
        </article>

        <article class="panel">
          <h3>Mis estadísticas</h3>
          <p class="endpoint">GET /api/estadisticas/mias</p>

          <div *ngIf="estadisticas as est; else sinStats" class="kpis">
            <div>
              <span>Total apostado</span>
              <strong>$ {{ est.resumen.total_apostado | number:'1.0-0' }}</strong>
            </div>
            <div>
              <span>Premios</span>
              <strong>$ {{ est.resumen.total_premios | number:'1.0-0' }}</strong>
            </div>
            <div>
              <span>Depósitos</span>
              <strong>$ {{ est.resumen.total_depositos | number:'1.0-0' }}</strong>
            </div>
            <div>
              <span>N° apuestas</span>
              <strong>{{ est.resumen.n_apuestas }}</strong>
            </div>
            <div>
              <span>Neto</span>
              <strong>$ {{ est.resumen.neto | number:'1.0-0' }}</strong>
            </div>
            <div>
              <span>Saldo actual</span>
              <strong>$ {{ est.resumen.saldo_actual | number:'1.0-0' }}</strong>
            </div>
          </div>

          <ng-template #sinStats>
            <p class="vacio">No se pudieron cargar estadísticas.</p>
          </ng-template>
        </article>
      </div>

      <div class="grid inferior">
        <article class="panel">
          <h3>Mis bonos reclamados</h3>
          <p class="endpoint">GET /api/bonos/mis-bonos</p>

          <div *ngIf="bonosReclamados.length; else sinReclamados">
            <div *ngFor="let b of bonosReclamados" class="item compacto">
              <strong>{{ b.codigo }} — {{ b.nombre }}</strong>
              <span>Monto otorgado: $ {{ b.monto_otorgado | number:'1.0-0' }}</span>
            </div>
          </div>

          <ng-template #sinReclamados>
            <p class="vacio">Aún no hay bonos reclamados.</p>
          </ng-template>
        </article>

        <article class="panel">
          <h3>Mis apuestas deportivas</h3>
          <p class="endpoint">GET /api/apuestas/mis-apuestas</p>

          <div *ngIf="misApuestas.length; else sinMisApuestas">
            <div *ngFor="let a of misApuestas" class="item compacto">
              <strong>{{ a.equipo_local }} vs {{ a.equipo_visita }}</strong>
              <span>
                Selección: {{ a.seleccion }} · Estado: {{ a.estado }}
              </span>
              <small>
                Monto: $ {{ a.monto | number:'1.0-0' }} · Cuota: {{ a.cuota }}
              </small>
            </div>
          </div>

          <ng-template #sinMisApuestas>
            <p class="vacio">Aún no tienes apuestas deportivas.</p>
          </ng-template>
        </article>
      </div>
    </section>
  `,
  styles: [`
    .dashboard {
      max-width: 1180px;
      margin: 30px auto;
    }

    .cabecera {
      display: flex;
      justify-content: space-between;
      gap: 16px;
      align-items: flex-start;
      margin-bottom: 18px;
    }

    .sub {
      color: #6a8a7a;
      margin-top: 6px;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
      gap: 16px;
    }

    .inferior {
      margin-top: 16px;
    }

    .panel {
      background: rgba(6, 14, 26, 0.82);
      border: 1px solid rgba(16, 185, 129, 0.14);
      border-radius: 14px;
      padding: 16px;
    }

    .panel h3 {
      color: #d4af37;
      margin: 0 0 4px;
    }

    .endpoint {
      font-size: 12px;
      color: #10b981;
      opacity: .82;
      margin-bottom: 14px;
    }

    .campo {
      display: grid;
      gap: 6px;
      color: #9ab8b0;
      font-size: 13px;
      margin-bottom: 14px;
    }

    .campo input {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 8px;
      padding: 8px 10px;
      color: #e0f0e8;
    }

    .item {
      display: grid;
      gap: 6px;
      padding: 12px 0;
      border-bottom: 1px solid rgba(255,255,255,0.06);
    }

    .item:last-child {
      border-bottom: 0;
    }

    .item strong {
      color: #e0f0e8;
    }

    .item span {
      color: #9ab8b0;
      font-size: 13px;
    }

    .item small {
      color: #6a8a7a;
    }

    .compacto {
      padding: 10px 0;
    }

    .mini {
      width: fit-content;
      padding: 6px 10px;
      font-size: 12px;
    }

    .acciones-apuesta {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 6px;
    }

    .kpis {
      display: grid;
      grid-template-columns: repeat(2, minmax(120px, 1fr));
      gap: 10px;
    }

    .kpis div {
      background: rgba(16, 185, 129, 0.06);
      border: 1px solid rgba(16, 185, 129, 0.14);
      border-radius: 10px;
      padding: 12px;
    }

    .kpis span {
      display: block;
      color: #6a8a7a;
      font-size: 12px;
      margin-bottom: 4px;
    }

    .kpis strong {
      color: #d4af37;
      font-size: 18px;
    }

    .vacio {
      color: #6a8a7a;
    }

    .ok {
      color: #10b981;
      background: rgba(16, 185, 129, 0.08);
      border: 1px solid rgba(16, 185, 129, 0.2);
      padding: 10px 12px;
      border-radius: 10px;
    }

    .error {
      color: #ffb4b4;
      background: rgba(255, 80, 80, 0.08);
      border: 1px solid rgba(255, 80, 80, 0.2);
      padding: 10px 12px;
      border-radius: 10px;
    }
  `]
})
export class DashboardComponent implements OnInit {
  bonos: Bono[] = [];
  bonosReclamados: BonoReclamado[] = [];
  eventos: EventoDeportivo[] = [];
  misApuestas: ApuestaDeportiva[] = [];
  estadisticas: EstadisticasMias | null = null;

  montoBaseBono = 10000;
  montoApuesta = 100;

  mensaje = '';
  error = '';

  constructor(private casino: CasinoService) {}

  ngOnInit(): void {
    this.cargarTodo();
  }

  cargarTodo(): void {
    this.error = '';

    this.casino.listarBonos().subscribe({
      next: (r) => this.bonos = r.bonos,
      error: () => this.error = 'No se pudieron cargar los bonos.'
    });

    this.casino.misBonos().subscribe({
      next: (r) => this.bonosReclamados = r.reclamados,
      error: () => this.bonosReclamados = []
    });

    this.casino.listarEventosDeportivos().subscribe({
      next: (r) => this.eventos = r.eventos,
      error: () => this.error = 'No se pudieron cargar los eventos deportivos.'
    });

    this.casino.misApuestasDeportivas().subscribe({
      next: (r) => this.misApuestas = r.apuestas,
      error: () => this.misApuestas = []
    });

    this.casino.misEstadisticas().subscribe({
      next: (r) => this.estadisticas = r,
      error: () => this.estadisticas = null
    });
  }

  reclamar(bono: Bono): void {
    this.mensaje = '';
    this.error = '';

    this.casino.reclamarBono(bono.codigo, this.montoBaseBono).subscribe({
      next: (r) => {
        this.mensaje = `Bono ${r.bono} reclamado. Monto otorgado: $${r.monto_otorgado}`;
        this.cargarTodo();
      },
      error: (e) => {
        this.error = e.error?.detail || e.error?.error || 'No se pudo reclamar el bono.';
      }
    });
  }

  apostar(evento: EventoDeportivo, seleccion: SeleccionApuestaDeportiva): void {
    this.mensaje = '';
    this.error = '';

    this.casino.apostarEvento(evento.id, seleccion, this.montoApuesta).subscribe({
      next: (r) => {
        this.mensaje = `Apuesta registrada. Ganancia potencial: $${r.ganancia_potencial}`;
        this.cargarTodo();
      },
      error: (e) => {
        this.error = e.error?.detail || e.error?.error || 'No se pudo registrar la apuesta.';
      }
    });
  }
}