package br.com.flexmedia.checkinhub.modules.conteudo;

import br.com.flexmedia.checkinhub.common.exception.ResourceNotFoundException;
import br.com.flexmedia.checkinhub.modules.conteudo.dto.ConteudoTotemDTO;
import br.com.flexmedia.checkinhub.modules.hotel.HotelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ConteudoTotemService {

    private final ConteudoTotemRepository conteudoTotemRepository;
    private final HotelRepository hotelRepository;

    public List<ConteudoTotemDTO> listar(Long hotelId) {
        return conteudoTotemRepository.findByHotelIdOrderByOrdemExibicaoAsc(hotelId)
                .stream().map(ConteudoTotemDTO::from).toList();
    }

    public List<ConteudoTotemDTO> listarAtivos(Long hotelId) {
        return conteudoTotemRepository.findByHotelIdAndAtivoTrueOrderByOrdemExibicaoAsc(hotelId)
                .stream().map(ConteudoTotemDTO::from).toList();
    }

    @Transactional
    public ConteudoTotemDTO criar(ConteudoTotemDTO dto) {
        ConteudoTotem conteudo = ConteudoTotem.builder()
                .hotel(hotelRepository.getReferenceById(dto.hotelId()))
                .tipo(dto.tipo())
                .titulo(dto.titulo())
                .urlMidia(dto.urlMidia())
                .ordemExibicao(dto.ordemExibicao())
                .ativo(dto.ativo())
                .build();
        return ConteudoTotemDTO.from(conteudoTotemRepository.save(conteudo));
    }

    @Transactional
    public ConteudoTotemDTO atualizar(Long id, ConteudoTotemDTO dto) {
        ConteudoTotem conteudo = conteudoTotemRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Conteúdo não encontrado: " + id));
        conteudo.setTipo(dto.tipo());
        conteudo.setTitulo(dto.titulo());
        conteudo.setUrlMidia(dto.urlMidia());
        conteudo.setOrdemExibicao(dto.ordemExibicao());
        conteudo.setAtivo(dto.ativo());
        return ConteudoTotemDTO.from(conteudoTotemRepository.save(conteudo));
    }

    @Transactional
    public void remover(Long id) {
        if (!conteudoTotemRepository.existsById(id)) {
            throw new ResourceNotFoundException("Conteúdo não encontrado: " + id);
        }
        conteudoTotemRepository.deleteById(id);
    }
}
