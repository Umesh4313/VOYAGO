package com.voyago.service;

import com.voyago.model.TravelOption;
import com.voyago.repository.TravelOptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TransportService {

    private final TravelOptionRepository travelOptionRepository;

    public List<TravelOption> getAll() {
        return travelOptionRepository.findAll();
    }

    public List<TravelOption> getByMode(String mode) {
        return travelOptionRepository.findByMode(mode.toUpperCase());
    }

    public List<TravelOption> search(String fromCity, String toCity, String mode) {
        if (mode != null && !mode.isEmpty()) {
            return travelOptionRepository.findByFromCityAndToCityAndMode(fromCity, toCity, mode.toUpperCase());
        }
        return travelOptionRepository.findByFromCityAndToCity(fromCity, toCity);
    }

    public TravelOption getById(String id) {
        return travelOptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Travel option not found: " + id));
    }

    public TravelOption create(TravelOption option) {
        return travelOptionRepository.save(option);
    }

    public TravelOption update(String id, TravelOption updated) {
        TravelOption existing = getById(id);
        updated.setId(existing.getId());
        return travelOptionRepository.save(updated);
    }

    public void delete(String id) {
        travelOptionRepository.deleteById(id);
    }
}
