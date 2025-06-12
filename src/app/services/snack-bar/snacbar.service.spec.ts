import { TestBed } from '@angular/core/testing';

import { SnacbarService } from './snacbar.service';

describe('SnacbarService', () => {
  let service: SnacbarService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SnacbarService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
