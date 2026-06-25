"use client";

import Image from "next/image";
import { useState } from "react";
import {
  DOB_DAYS,
  DOB_MONTHS,
  DOB_YEARS,
  GENDERS,
  PROFILE_USER,
} from "@/data/profile";
import { CameraIcon } from "../icons";
import { Field, PanelHeader, PrimaryButton, SelectField } from "../ui";

export default function ProfileDetails({ onExit }: { onExit: () => void }) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(PROFILE_USER.firstName);
  const [lastName, setLastName] = useState(PROFILE_USER.lastName);
  const [phone, setPhone] = useState(PROFILE_USER.phone);
  const [day, setDay] = useState(PROFILE_USER.dob.day);
  const [month, setMonth] = useState(PROFILE_USER.dob.month);
  const [year, setYear] = useState(PROFILE_USER.dob.year);
  const [gender, setGender] = useState(PROFILE_USER.gender);
  const fieldState = editing ? "edit" : "view";

  return (
    <div className="max-w-[530px]">
      <PanelHeader
        title={editing ? "Edit Profile" : "Profile"}
        onBack={editing ? () => setEditing(false) : onExit}
      />

      {editing ? (
        <div className="mb-6 flex justify-center">
          <div className="relative size-[64px]">
            <div className="size-full overflow-hidden rounded-full bg-[#151515]">
              <Image
                src="/collection/product-earrings.jpg"
                alt="Profile photo"
                width={64}
                height={64}
                className="size-full object-cover"
              />
            </div>
            <span className="absolute bottom-0 right-0 flex size-6 items-center justify-center rounded-full border-2 border-white bg-[#151515] text-white">
              <CameraIcon className="size-3" />
            </span>
          </div>
        </div>
      ) : null}

      <div className="space-y-5">
        <Field label="First Name" value={firstName} onChange={setFirstName} state={fieldState} />
        <Field label="Last Name" value={lastName} onChange={setLastName} state={fieldState} />
        <Field label="Phone Number" value={phone} onChange={setPhone} state={fieldState} />
        <Field label="Email Address" value={PROFILE_USER.email} state="disabled" />

        <div>
          <span className="mb-2 block text-sm text-[#404040]">DOB</span>
          <div className="grid grid-cols-3 gap-3">
            <SelectField value={day} onChange={setDay} options={DOB_DAYS} placeholder="Day" state={fieldState} />
            <SelectField value={month} onChange={setMonth} options={DOB_MONTHS} placeholder="Month" state={fieldState} />
            <SelectField value={year} onChange={setYear} options={DOB_YEARS} placeholder="Year" state={fieldState} />
          </div>
        </div>

        <SelectField
          label="Gender"
          value={gender}
          onChange={setGender}
          options={GENDERS}
          placeholder="Choose from here"
          state={fieldState}
        />

        <PrimaryButton onClick={() => setEditing((e) => !e)}>
          {editing ? "Save Changes" : "Edit"}
        </PrimaryButton>
      </div>
    </div>
  );
}
