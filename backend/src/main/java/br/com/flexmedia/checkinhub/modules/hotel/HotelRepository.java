package br.com.flexmedia.checkinhub.modules.hotel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface HotelRepository extends JpaRepository<Hotel, Long> {
    List<Hotel> findAllByAtivoTrue();
    Optional<Hotel> findByCnpj(String cnpj);
    boolean existsByCnpj(String cnpj);
}
