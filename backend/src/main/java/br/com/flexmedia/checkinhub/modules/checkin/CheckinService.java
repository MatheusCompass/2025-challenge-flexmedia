package br.com.flexmedia.checkinhub.modules.checkin;

import br.com.flexmedia.checkinhub.common.exception.BusinessException;
import br.com.flexmedia.checkinhub.modules.hotel.Reserva;
import br.com.flexmedia.checkinhub.modules.hotel.ReservaRepository;
import br.com.flexmedia.checkinhub.modules.hotel.ReservaService;
import br.com.flexmedia.checkinhub.modules.hotel.StatusReserva;
import br.com.flexmedia.checkinhub.modules.hotel.dto.ReservaResponseDTO;
import br.com.flexmedia.checkinhub.modules.metrics.MetricasService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CheckinService {

    private final ReservaService reservaService;
    private final ReservaRepository reservaRepository;
    private final MetricasService metricasService;

    public ReservaResponseDTO buscarParaCheckin(String codigoOuCpf) {
        // Tenta por código primeiro, depois por CPF
        try {
            return reservaService.buscarPorCodigo(codigoOuCpf);
        } catch (Exception e) {
            Reserva r = reservaRepository
                    .findByHospedeCpfAndStatus(codigoOuCpf, StatusReserva.CONFIRMADA)
                    .orElseThrow(() -> new BusinessException("Reserva não encontrada para: " + codigoOuCpf));
            return ReservaResponseDTO.from(r);
        }
    }

    @Transactional
    public ReservaResponseDTO confirmarCheckin(Long reservaId) {
        Reserva reserva = reservaService.findOrThrow(reservaId);

        if (reserva.getStatus() != StatusReserva.CONFIRMADA) {
            throw new BusinessException("Check-in não permitido. Status atual: " + reserva.getStatus());
        }

        reserva.setStatus(StatusReserva.CHECKIN_REALIZADO);
        reservaRepository.save(reserva);

        metricasService.registrarCheckin(reserva.getHotel().getId());

        return ReservaResponseDTO.from(reserva);
    }
}
