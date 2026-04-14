package br.com.flexmedia.checkinhub.modules.conteudo;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConteudoTotemRepository extends JpaRepository<ConteudoTotem, Long> {
    List<ConteudoTotem> findByHotelIdOrderByOrdemExibicaoAsc(Long hotelId);
    List<ConteudoTotem> findByHotelIdAndAtivoTrueOrderByOrdemExibicaoAsc(Long hotelId);
}
