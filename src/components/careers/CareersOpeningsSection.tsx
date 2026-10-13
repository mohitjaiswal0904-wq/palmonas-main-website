'use client';

import { useState } from 'react';

import { CareersJobCard } from '@/components/careers/CareersJobCard';
import { CareersJobDetailModal } from '@/components/careers/CareersJobDetailModal';
import {
  CareersSectionHeader,
  CareersSectionShell,
} from '@/components/careers/CareersSectionHeader';
import { careerJobOpenings, careersOpenings, type CareerJobOpening } from '@/config/careers.config';

/** Open positions grid with job detail / apply modal. */
export function CareersOpeningsSection() {
  const [selectedJob, setSelectedJob] = useState<CareerJobOpening | null>(null);

  return (
    <>
      <CareersSectionShell aria-labelledby="careers-openings-heading">
        <CareersSectionHeader
          badge={careersOpenings.badge}
          heading={careersOpenings.heading}
          description={careersOpenings.description}
          headingId="careers-openings-heading"
          descriptionClassName="mb-4 tab:mb-5"
        />

        <div className="tab:grid-cols-2 tab:gap-4 grid grid-cols-1 gap-3" role="list">
          {careerJobOpenings.map((job) => (
            <div key={job.id} role="listitem">
              <CareersJobCard job={job} onSelect={setSelectedJob} />
            </div>
          ))}
        </div>
      </CareersSectionShell>

      {selectedJob ? (
        <CareersJobDetailModal
          key={selectedJob.id}
          job={selectedJob}
          onClose={() => setSelectedJob(null)}
        />
      ) : null}
    </>
  );
}
