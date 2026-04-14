package br.com.flexmedia.checkinhub.modules.keys;

import br.com.flexmedia.checkinhub.common.exception.BusinessException;
import br.com.flexmedia.checkinhub.modules.hotel.Reserva;
import br.com.flexmedia.checkinhub.modules.hotel.ReservaService;
import br.com.flexmedia.checkinhub.modules.hotel.StatusReserva;
import br.com.flexmedia.checkinhub.modules.keys.dto.ChaveResponseDTO;
import br.com.flexmedia.checkinhub.modules.metrics.MetricasService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChavesService {

    private final ChaveDigitalRepository chaveDigitalRepository;
    private final ReservaService reservaService;
    private final MetricasService metricasService;

    @Transactional
    public ChaveResponseDTO emitirChave(Long reservaId) {
        Reserva reserva = reservaService.findOrThrow(reservaId);

        if (reserva.getStatus() != StatusReserva.CHECKIN_REALIZADO) {
            throw new BusinessException("Chave só pode ser emitida após check-in confirmado.");
        }

        // Invalida chaves anteriores da mesma reserva
        chaveDigitalRepository.findByReservaIdAndAtivaTrue(reservaId)
                .forEach(c -> {
                    c.setAtiva(false);
                    chaveDigitalRepository.save(c);
                });

        ChaveDigital chave = ChaveDigital.builder()
                .reserva(reserva)
                .token(UUID.randomUUID().toString().toUpperCase().replace("-", ""))
                .tipo(TipoChave.DIGITAL)
                .dataExpiracao(reserva.getDataCheckout().atTime(12, 0))
                .ativa(true)
                .build();

        chaveDigitalRepository.save(chave);
        metricasService.registrarChaveEmitida(reserva.getHotel().getId());

        return ChaveResponseDTO.from(chave);
    }
}
