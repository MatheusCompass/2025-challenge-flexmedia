package br.com.flexmedia.checkinhub.modules.hotel;

import br.com.flexmedia.checkinhub.common.exception.BusinessException;
import br.com.flexmedia.checkinhub.common.exception.ResourceNotFoundException;
import br.com.flexmedia.checkinhub.modules.hotel.dto.HotelRequestDTO;
import br.com.flexmedia.checkinhub.modules.hotel.dto.HotelResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HotelService {

    private final HotelRepository hotelRepository;

    public Page<HotelResponseDTO> listar(Pageable pageable) {
        return hotelRepository.findAll(pageable).map(HotelResponseDTO::from);
    }

    public HotelResponseDTO buscarPorId(Long id) {
        return HotelResponseDTO.from(findOrThrow(id));
    }

    @Transactional
    public HotelResponseDTO criar(HotelRequestDTO dto) {
        if (hotelRepository.existsByCnpj(dto.cnpj())) {
            throw new BusinessException("CNPJ já cadastrado: " + dto.cnpj());
        }
        Hotel hotel = Hotel.builder()
                .nome(dto.nome()).cnpj(dto.cnpj())
                .cidade(dto.cidade()).estado(dto.estado())
                .build();
        return HotelResponseDTO.from(hotelRepository.save(hotel));
    }

    @Transactional
    public HotelResponseDTO atualizar(Long id, HotelRequestDTO dto) {
        Hotel hotel = findOrThrow(id);
        hotel.setNome(dto.nome());
        hotel.setCidade(dto.cidade());
        hotel.setEstado(dto.estado());
        return HotelResponseDTO.from(hotelRepository.save(hotel));
    }

    @Transactional
    public void desativar(Long id) {
        Hotel hotel = findOrThrow(id);
        hotel.setAtivo(false);
        hotelRepository.save(hotel);
    }

    Hotel findOrThrow(Long id) {
        return hotelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel não encontrado: " + id));
    }
}
