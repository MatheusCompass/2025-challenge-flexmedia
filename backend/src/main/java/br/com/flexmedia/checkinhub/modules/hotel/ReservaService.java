package br.com.flexmedia.checkinhub.modules.hotel;

import br.com.flexmedia.checkinhub.common.exception.ResourceNotFoundException;
import br.com.flexmedia.checkinhub.modules.hotel.dto.ReservaResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ReservaService {

    private final ReservaRepository reservaRepository;

    public Page<ReservaResponseDTO> listar(Long hotelId, String busca, Pageable pageable) {
        if (hotelId != null) {
            return reservaRepository.findByHotelAndBusca(hotelId, busca, pageable)
                    .map(ReservaResponseDTO::from);
        }
        return reservaRepository.findAll(pageable).map(ReservaResponseDTO::from);
    }

    public ReservaResponseDTO buscarPorId(Long id) {
        return ReservaResponseDTO.from(findOrThrow(id));
    }

    public ReservaResponseDTO buscarPorCodigo(String codigo) {
        return ReservaResponseDTO.from(
                reservaRepository.findByCodigoReserva(codigo)
                        .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada: " + codigo))
        );
    }

    public Reserva findOrThrow(Long id) {
        return reservaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada: " + id));
    }

    public Reserva findByCodigoOrThrow(String codigo) {
        return reservaRepository.findByCodigoReserva(codigo)
                .orElseThrow(() -> new ResourceNotFoundException("Reserva não encontrada: " + codigo));
    }
}
