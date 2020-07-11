import { IsString } from 'class-validator';


export class GitHubLoginDto {
  @IsString()
  githubId!: string;

  @IsString()
  githubUsername!: string;
}
