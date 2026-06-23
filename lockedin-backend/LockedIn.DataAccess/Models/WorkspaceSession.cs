using System;

namespace LockedIn.DataAccess.Models;

public partial class WorkspaceSession
{
    public Guid Id { get; set; }

    public Guid WorkspaceId { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }

    public virtual Workspace Workspace { get; set; } = null!;
}
