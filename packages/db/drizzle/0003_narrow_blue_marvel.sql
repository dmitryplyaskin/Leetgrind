CREATE TABLE "profile_skills" (
	"profile_id" uuid DEFAULT '00000000-0000-0000-0000-000000000001' NOT NULL,
	"skill_id" uuid NOT NULL,
	"level" text DEFAULT 'unknown' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "profile_skills_profile_id_skill_id_pk" PRIMARY KEY("profile_id","skill_id")
);
--> statement-breakpoint
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_profile_id_user_profiles_id_fk" FOREIGN KEY ("profile_id") REFERENCES "public"."user_profiles"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "profile_skills" ADD CONSTRAINT "profile_skills_skill_id_skills_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skills"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE INDEX "profile_skills_skill_id_idx" ON "profile_skills" USING btree ("skill_id");
