package br.com.flexmedia.checkinhub.modules.keys;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChaveDigitalRepository extends JpaRepository<ChaveDigital, Long> {
    List<ChaveDigital> findByReservaIdAndAtivaTrue(Long reservaId);
    void deleteAllByReservaId(Long reservaId);
}
