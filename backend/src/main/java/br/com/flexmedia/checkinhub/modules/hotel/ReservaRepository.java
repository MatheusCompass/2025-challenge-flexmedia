package br.com.flexmedia.checkinhub.modules.hotel;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ReservaRepository extends JpaRepository<Reserva, Long> {

    Optional<Reserva> findByCodigoReserva(String codigoReserva);

    Optional<Reserva> findByHospedeCpfAndStatus(String hospedeCpf, StatusReserva status);

    @Query("SELECT r FROM Reserva r WHERE r.hotel.id = :hotelId AND " +
           "(:busca IS NULL OR LOWER(r.hospedeNome) LIKE LOWER(CONCAT('%', :busca, '%')) " +
           "OR LOWER(r.codigoReserva) LIKE LOWER(CONCAT('%', :busca, '%')) " +
           "OR r.hospedeCpf LIKE CONCAT('%', :busca, '%'))")
    Page<Reserva> findByHotelAndBusca(@Param("hotelId") Long hotelId,
                                       @Param("busca") String busca,
                                       Pageable pageable);

    Page<Reserva> findAll(Pageable pageable);
}
