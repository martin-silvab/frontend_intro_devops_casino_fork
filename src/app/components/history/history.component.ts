import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CasinoService } from '../../services/casino.service';
import { Transaccion } from '../../models/casino.models';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="tarjeta h-cont">
      <h2 class="titulo-juego">📋 Historial</h2>

      <p *ngIf="!cargando && tx.length === 0">
        Aún no hay movimientos. ¡Anda al lobby a jugar!
      </p>

      <table *ngIf="tx.length">
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Tipo</th>
            <th>Origen</th>
            <th>Detalle</th>
            <th>Monto</th>
            <th>Saldo después</th>
          </tr>
        </thead>

        <tbody>
          <tr *ngFor="let t of tx" [class.gano]="esCredito(t)" [class.perdio]="esDebito(t)">
            <td>{{ formato(t.creada_en) }}</td>
            <td>{{ tipoVisible(t) }}</td>
            <td>{{ origenVisible(t) }}</td>
            <td>{{ detalleVisible(t) }}</td>
            <td>{{ esDebito(t) ? '-' : '+' }} $ {{ t.monto | number:'1.0-0' }}</td>
            <td>$ {{ t.saldo_post | number:'1.0-0' }}</td>
          </tr>
        </tbody>
      </table>

      <p *ngIf="error" class="error">{{ error }}</p>
    </section>
  `,
  styles: [`
    .h-cont {
      max-width: 1120px;
      margin: 30px auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 10px 8px;
      border-bottom: 1px solid rgba(255,255,255,0.08);
      text-align: left;
      vertical-align: top;
    }

    th {
      color: #d4af37;
      font-size: 13px;
      letter-spacing: .5px;
    }

    td {
      color: #dbe7df;
      font-size: 14px;
    }

    tr.gano td {
      color: #aef0a8;
    }

    tr.perdio td {
      color: #ffb1b1;
    }

    td:first-child {
      font-size: 13px;
      color: #c8b988;
      white-space: nowrap;
    }

    td:nth-child(2) {
      font-weight: 700;
      text-transform: capitalize;
    }

    td:nth-child(4) {
      color: #9ab8b0;
      max-width: 360px;
    }
  `]
})
export class HistoryComponent implements OnInit {
  tx: Transaccion[] = [];
  cargando = true;
  error = '';

  constructor(private casino: CasinoService) {}

  ngOnInit() {
    this.casino.historial(100).subscribe({
      next: (t) => {
        this.tx = t;
        this.cargando = false;
      },
      error: (e) => {
        this.cargando = false;
        this.error = e.error?.error || 'No se pudo cargar el historial';
      }
    });
  }

  esCredito(t: Transaccion) {
    return t.tipo === 'premio' || t.tipo === 'deposito' || t.tipo === 'ajuste';
  }

  esDebito(t: Transaccion) {
    return t.tipo === 'apuesta' || t.tipo === 'retiro';
  }

  tipoVisible(t: Transaccion) {
    const detalle = this.obtenerDetalle(t);

    if (t.tipo === 'deposito' && detalle.bono) {
      return 'bono reclamado';
    }

    if (t.tipo === 'apuesta' && detalle.partido) {
      return 'apuesta deportiva';
    }

    if (t.tipo === 'premio' && detalle.evento_id) {
      return 'premio deportivo';
    }

    return t.tipo;
  }

  origenVisible(t: Transaccion) {
    const detalle = this.obtenerDetalle(t);

    if (detalle.bono) {
      return 'Bonos';
    }

    if (detalle.partido || detalle.evento_id) {
      return 'Apuestas deportivas';
    }

    return t.juego || '—';
  }

  detalleVisible(t: Transaccion) {
    const detalle = this.obtenerDetalle(t);

    if (detalle.bono) {
      const nombre = detalle.nombre ? ` — ${detalle.nombre}` : '';
      return `${detalle.bono}${nombre}`;
    }

    if (detalle.partido) {
      const seleccion = detalle.seleccion ? this.seleccionVisible(detalle.seleccion) : 'Sin selección';
      const cuota = detalle.cuota ? ` · Cuota ${detalle.cuota}` : '';
      return `${detalle.partido} · ${seleccion}${cuota}`;
    }

    if (detalle.evento_id && detalle.resultado) {
      return `Evento #${detalle.evento_id} · Resultado: ${this.seleccionVisible(detalle.resultado)}`;
    }

    if (t.juego) {
      return 'Juego de casino';
    }

    return '—';
  }

  formato(iso: string) {
    return new Date(iso).toLocaleString('es-CL', {
      dateStyle: 'short',
      timeStyle: 'short'
    });
  }

  private obtenerDetalle(t: Transaccion): any {
    if (!t.detalle) return {};

    if (typeof t.detalle === 'string') {
      try {
        return JSON.parse(t.detalle);
      } catch {
        return {};
      }
    }

    return t.detalle;
  }

  private seleccionVisible(seleccion: string) {
    const nombres: Record<string, string> = {
      local: 'Local',
      empate: 'Empate',
      visita: 'Visita'
    };

    return nombres[seleccion] || seleccion;
  }
}