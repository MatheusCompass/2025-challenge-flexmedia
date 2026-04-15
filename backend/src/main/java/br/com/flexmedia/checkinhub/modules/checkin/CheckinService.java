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

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CheckinService {

    private final ReservaService reservaService;
    private final ReservaRepository reservaRepository;
    private final MetricasService metricasService;

    public ReservaResponseDTO buscarParaCheckin(String codigoOuCpf) {
        String entrada = codigoOuCpf == null ? "" : codigoOuCpf.trim();
        if (entrada.isBlank()) {
            throw new BusinessException("Código/CPF não informado.");
        }

        // Tenta por código primeiro (qualquer status), depois por CPF (com e sem máscara)
        try {
            return reservaService.buscarPorCodigo(entrada);
        } catch (Exception e) {
            // Retorna reserva de qualquer status — o frontend decide o que exibir
            List<StatusReserva> todosStatus = List.of(
                    StatusReserva.CONFIRMADA,
                    StatusReserva.CHECKIN_REALIZADO,
                    StatusReserva.CHECKOUT_REALIZADO,
                    StatusReserva.CANCELADA
            );
            for (String candidatoCpf : gerarCandidatosCpf(entrada)) {
                var reserva = reservaRepository.findFirstByCpfAndStatusIn(candidatoCpf, todosStatus);
                if (reserva.isPresent()) {
                    return ReservaResponseDTO.from(reserva.get());
                }
            }
            throw new BusinessException("Reserva não encontrada para: " + entrada);
        }
    }

    private List<String> gerarCandidatosCpf(String valor) {
        List<String> candidatos = new ArrayList<>();
        candidatos.add(valor);

        String digits = valor.replaceAll("\\D", "");
        if (!digits.isEmpty()) {
            candidatos.add(digits);
            if (digits.length() == 11) {
                candidatos.add(formatarCpf(digits));
            }
        }

        return candidatos.stream().distinct().toList();
    }

    private String formatarCpf(String digits) {
        return digits.substring(0, 3) + "."
                + digits.substring(3, 6) + "."
                + digits.substring(6, 9) + "-"
                + digits.substring(9, 11);
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
