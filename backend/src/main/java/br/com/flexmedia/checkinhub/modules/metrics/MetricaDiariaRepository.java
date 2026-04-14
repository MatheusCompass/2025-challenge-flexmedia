package br.com.flexmedia.checkinhub.modules.metrics;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface MetricaDiariaRepository extends JpaRepository<MetricaDiaria, Long> {

    Optional<MetricaDiaria> findByHotelIdAndData(Long hotelId, LocalDate data);

    List<MetricaDiaria> findByHotelIdAndDataBetweenOrderByDataAsc(
            Long hotelId, LocalDate inicio, LocalDate fim);

    @Query("SELECT SUM(m.totalCheckins) FROM MetricaDiaria m WHERE m.data = :data")
    Long sumTotalCheckinsByData(@Param("data") LocalDate data);

    @Query("SELECT SUM(m.totalCheckouts) FROM MetricaDiaria m WHERE m.data = :data")
    Long sumTotalCheckoutsByData(@Param("data") LocalDate data);

    @Query("SELECT SUM(m.totalChavesEmitidas) FROM MetricaDiaria m WHERE m.data = :data")
    Long sumTotalChavesByData(@Param("data") LocalDate data);
}
